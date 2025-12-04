import { NextRequest, NextResponse } from "next/server";
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { buildNOAPrompt, parseNOAResponse } from "@/lib/prompt-engineering";
import { recommendNOASchema } from "@/lib/validation";

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
 * Claude 3.7 Sonnet and newer models require inference profiles
 */
function getInferenceProfileId(modelId: string, region: string = "us-east-1"): string {
  // If already an inference profile ID (starts with us., global., etc.), return as-is
  if (modelId.match(/^(us|global|eu|ap)\./)) {
    return modelId;
  }

  // Convert model ID to inference profile format
  // For US region: us.anthropic.claude-3-7-sonnet-20250219-v1:0
  // For global: global.anthropic.claude-3-7-sonnet-20250219-v1:0
  
  // Determine region prefix
  let regionPrefix = "us"; // default to US
  if (region.startsWith("eu-")) {
    regionPrefix = "eu";
  } else if (region.startsWith("ap-")) {
    regionPrefix = "ap";
  }

  // Extract the model identifier (everything after anthropic.)
  const modelPart = modelId.replace(/^anthropic\./, "");
  
  // Return inference profile ID
  return `${regionPrefix}.anthropic.${modelPart}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input with Zod schema
    const validationResult = recommendNOASchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: "Invalid input",
          details: validationResult.error.issues.map(err => ({
            field: err.path.join("."),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    const { scenario } = validationResult.data;

    // Build the prompt using our prompt engineering utility
    const prompt = buildNOAPrompt(scenario);

    // Get model ID from environment (defaults to Claude 3.7 Sonnet)
    const rawModelId = process.env.BEDROCK_MODEL_ID || "anthropic.claude-3-7-sonnet-20250219-v1:0";
    const region = process.env.AWS_REGION || "us-east-1";
    
    // Convert to inference profile ID if needed (required for Claude 3.7+)
    const modelId = getInferenceProfileId(rawModelId, region);

    // Prepare the request for Claude (supports Claude 3.5, 3.7, Sonnet 4, and newer models)
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
    
    // Provide more helpful error messages for common issues
    let errorMessage = error.message || "Unknown error";
    let userFriendlyMessage = "Failed to get recommendation";
    
    if (errorMessage.includes("not authorized") || errorMessage.includes("ViewSubscriptions")) {
      userFriendlyMessage = "Model access denied. Please ensure: 1) Model access is granted in AWS Bedrock console, 2) IAM user has bedrock:InvokeModel permission, 3) Wait 15 minutes after granting access.";
    } else if (errorMessage.includes("on-demand throughput isn't supported") || errorMessage.includes("inference profile")) {
      userFriendlyMessage = "This model requires an inference profile. The code should automatically convert the model ID. If the error persists, check that the model ID format is correct.";
    } else if (errorMessage.includes("AccessDeniedException")) {
      userFriendlyMessage = "Access denied. Check IAM permissions and model access in Bedrock console.";
    } else if (errorMessage.includes("ValidationException")) {
      userFriendlyMessage = "Invalid request format. Please check the model ID and request structure.";
    }
    
    return NextResponse.json(
      {
        error: userFriendlyMessage,
        message: errorMessage,
        details: "See console logs for more details. Check AWS Bedrock model access and IAM permissions.",
      },
      { status: 500 }
    );
  }
}

