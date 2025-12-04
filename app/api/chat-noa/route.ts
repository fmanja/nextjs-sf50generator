import { NextRequest, NextResponse } from "next/server";
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { buildNOAPrompt, parseNOAResponse } from "@/lib/prompt-engineering";

// Initialize Bedrock client
const bedrockClient = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

/**
 * Converts a model ID to an inference profile ID if needed
 */
function getInferenceProfileId(modelId: string, region: string = "us-east-1"): string {
  if (modelId.match(/^(us|global|eu|ap)\./)) {
    return modelId;
  }

  let regionPrefix = "us";
  if (region.startsWith("eu-")) {
    regionPrefix = "eu";
  } else if (region.startsWith("ap-")) {
    regionPrefix = "ap";
  }

  const modelPart = modelId.replace(/^anthropic\./, "");
  return `${regionPrefix}.anthropic.${modelPart}`;
}

/**
 * Builds a conversational prompt that includes the original scenario and conversation history
 */
function buildConversationalPrompt(
  originalScenario: string,
  conversationHistory: Array<{ role: "user" | "assistant"; content: string }>
): string {
  const conversationText = conversationHistory
    .map((msg) => {
      if (msg.role === "assistant") {
        return `Assistant: ${msg.content}`;
      }
      return `User: ${msg.content}`;
    })
    .join("\n");

  return `You are an expert HR specialist helping to recommend the correct Nature of Action (NOA) code for Federal employee personnel actions.

Original Scenario: ${originalScenario}

Conversation History:
${conversationText}

Based on the original scenario and the conversation above, provide an updated recommendation. Your response must follow this exact format:
"Recommendation: NOA [code] – [label] | LAC: [authority code if applicable]. Required SF-50 fields: [field 1], [field 2], [and other relevant fields]. OPM NOA Remarks: [suggested remarks text for the SF-50 remarks field]."

If LAC is not applicable, you may omit it. Always list the key SF-50 fields that must be completed. Provide suggested OPM NOA Remarks that are appropriate for the specific action type.

Output:`;
}

export async function POST(request: NextRequest) {
  try {
    const { originalScenario, conversationHistory } = await request.json();

    if (!originalScenario || typeof originalScenario !== "string") {
      return NextResponse.json(
        { error: "Original scenario is required and must be a string" },
        { status: 400 }
      );
    }

    if (!Array.isArray(conversationHistory)) {
      return NextResponse.json(
        { error: "Conversation history must be an array" },
        { status: 400 }
      );
    }

    // Build the conversational prompt
    const prompt = buildConversationalPrompt(originalScenario, conversationHistory);

    // Get model ID from environment
    const rawModelId = process.env.BEDROCK_MODEL_ID || "anthropic.claude-3-7-sonnet-20250219-v1:0";
    const region = process.env.AWS_REGION || "us-east-1";
    const modelId = getInferenceProfileId(rawModelId, region);

    // Prepare the request for Claude
    const requestBody = {
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt,
            },
          ],
        },
      ],
    };

    const input = {
      modelId,
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify(requestBody),
    };

    // Invoke the model
    const command = new InvokeModelCommand(input);
    const response = await bedrockClient.send(command);

    // Parse the response
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    const content = responseBody.content?.[0]?.text || "";

    if (!content) {
      return NextResponse.json(
        { error: "No response from model" },
        { status: 500 }
      );
    }

    // Parse the structured response
    const recommendation = parseNOAResponse(content);

    return NextResponse.json({
      recommendation,
      rawResponse: content,
    });
  } catch (error: any) {
    console.error("Error calling Bedrock:", error);
    
    let errorMessage = error.message || "Unknown error";
    let userFriendlyMessage = "Failed to get updated recommendation";
    
    if (errorMessage.includes("not authorized") || errorMessage.includes("ViewSubscriptions")) {
      userFriendlyMessage = "Model access denied. Please ensure: 1) Model access is granted in AWS Bedrock console, 2) IAM user has bedrock:InvokeModel permission, 3) Wait 15 minutes after granting access.";
    } else if (errorMessage.includes("on-demand throughput isn't supported") || errorMessage.includes("inference profile")) {
      userFriendlyMessage = "This model requires an inference profile. The code should automatically convert the model ID.";
    } else if (errorMessage.includes("AccessDeniedException")) {
      userFriendlyMessage = "Access denied. Check IAM permissions and model access in Bedrock console.";
    } else if (errorMessage.includes("ValidationException")) {
      userFriendlyMessage = "Invalid request format. Please check the model ID and request structure.";
    }
    
    return NextResponse.json(
      {
        error: userFriendlyMessage,
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}

