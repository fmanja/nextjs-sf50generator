/**
 * Prompt engineering utilities for NOA (Nature of Action) recommendations
 * Based on the NOA fine-tuning dataset examples
 */

export interface NOARecommendation {
  noa: string;
  label: string;
  lac?: string;
  clarifications: string[];
  requiredSF50Fields?: string[];
  opmRemarks?: string; // Suggested OPM NOA Remarks for SF-50
  remarkCodes?: string[]; // Any specific remark codes if applicable
}

/**
 * Builds a prompt for Claude to recommend NOA codes based on employee scenarios
 */
export function buildNOAPrompt(scenario: string): string {
  const examples = [
    {
      instruction: "Employee is being permanently promoted from GS-12 step 5 to GS-13 step 1 after competitive selection.",
      output: "Recommendation: NOA 702 – Promotion | LAC: 5 CFR 335.103. Clarifications: Effective date? Competitive certificate number? Required SF-50 fields: Position title, pay plan, grade, step, duty station, service computation date, and prior position data. OPM NOA Remarks: Permanent promotion from GS-12 Step 5 to GS-13 Step 1 via competitive selection process."
    },
    {
      instruction: "Employee is moving from one office to another within the same agency with no change in grade or duties.",
      output: "Recommendation: NOA 721 – Reassignment. Clarifications: Is this management-directed? Any change in FLSA or duty station? Required SF-50 fields: Old and new org codes, position title, duty station, grade/step unchanged. OPM NOA Remarks: Reassignment within same agency, no change in grade or duties."
    },
    {
      instruction: "Employee is receiving a within-grade increase (WIGI) from step 2 to step 3.",
      output: "Recommendation: NOA 891 – Within-Grade Increase. LAC: 5 USC 5335. Clarifications: WIGI due date confirmed? Performance rating meets criteria? Required SF-50: Step before/after, effective date. OPM NOA Remarks: Within-grade increase from Step 2 to Step 3 per 5 USC 5335."
    },
    {
      instruction: "Employee is converting from a term appointment to a permanent career appointment.",
      output: "Recommendation: NOA 508 – Conversion to Career. LAC: Reg 5 CFR 316. Clarifications: Was the conversion competitive or noncompetitive? Required SF-50: Tenure, position occupied, work schedule. OPM NOA Remarks: Conversion from term appointment to permanent career appointment per 5 CFR 316."
    },
    {
      instruction: "Employee is going on a temporary promotion from GS-12 to GS-13 for 120 days.",
      output: "Recommendation: NOA 703 – Temporary Promotion. LAC: 5 CFR 335. Clarifications: End date? Has employee met time-in-grade? Required SF-50: Not-to-exceed date, grade/step, position title. OPM NOA Remarks: Temporary promotion from GS-12 to GS-13, not to exceed 120 days."
    },
    {
      instruction: "Employee is retiring under regular FERS.",
      output: "Recommendation: NOA 302 – Retirement (Voluntary). Clarifications: Confirm retirement type. Required SF-50: Retirement code, SCD, FEHB/FEGLI remarks. OPM NOA Remarks: Voluntary retirement under FERS retirement system."
    },
    {
      instruction: "Employee is receiving a quality step increase.",
      output: "Recommendation: NOA 892 – Quality Step Increase (QSI). LAC: 5 USC 5336. Clarifications: Performance rating? Required SF-50: Step increase, remarks. OPM NOA Remarks: Quality Step Increase awarded based on outstanding performance per 5 USC 5336."
    },
    {
      instruction: "Employee's duty station is changing from DC to Baltimore.",
      output: "Recommendation: NOA 792 – Change in Duty Station. Clarifications: Telework status? Physical office location? Required SF-50: New duty station code. OPM NOA Remarks: Change in duty station from Washington, DC to Baltimore, MD."
    }
  ];

  const examplesText = examples
    .map((ex, i) => `Example ${i + 1}:
Instruction: ${ex.instruction}
Output: ${ex.output}`)
    .join("\n\n");

  return `You are an expert HR specialist helping to recommend the correct Nature of Action (NOA) code for Federal employee personnel actions. Based on the employee scenario provided, recommend the appropriate NOA code, Legal Authority Code (LAC) if applicable, clarifications needed, required SF-50 fields, and suggested OPM NOA Remarks.

Your response must follow this exact format:
"Recommendation: NOA [code] – [label] | LAC: [authority code if applicable]. Clarifications: [question 1]? [question 2]? Required SF-50 fields: [field 1], [field 2], [and other relevant fields]. OPM NOA Remarks: [suggested remarks text for the SF-50 remarks field]."

If LAC is not applicable or not needed, you may omit it. Always provide at least 2-3 clarifications and list the key SF-50 fields that must be completed. Provide suggested OPM NOA Remarks that are appropriate for the specific action type and can be used in the SF-50 remarks field.

Here are some examples:

${examplesText}

Now, analyze this scenario and provide your recommendation:

Instruction: ${scenario}
Output:`;
}

/**
 * Parses the Claude response into a structured NOARecommendation object
 */
export function parseNOAResponse(response: string): NOARecommendation {
  const result: NOARecommendation = {
    noa: "",
    label: "",
    clarifications: [],
  };

  // Extract NOA code and label - handle both "NOA 702 – Promotion |" and "NOA 702 – Promotion."
  const noaMatch = response.match(/NOA\s+(\d+)\s*[–-]\s*([^|\.]+?)(?:\s*\||\.|$)/i);
  if (noaMatch) {
    result.noa = noaMatch[1].trim();
    result.label = noaMatch[2].trim();
  }

  // Extract LAC - can appear after | or in a separate sentence
  const lacMatch = response.match(/LAC:\s*([^\.\?]+?)(?:\.|$|\?)/i);
  if (lacMatch) {
    result.lac = lacMatch[1].trim();
  }

  // Extract clarifications - improved regex to capture multiple questions
  const clarificationsMatch = response.match(/Clarifications:\s*([^R]+?)(?:Required|$)/is);
  if (clarificationsMatch) {
    const clarificationsText = clarificationsMatch[1];
    // Split by question marks, but keep questions together
    const questions = clarificationsText
      .split(/\?+/)
      .map((c) => c.trim())
      .filter((c) => c.length > 0);
    
    result.clarifications = questions.map((q) => {
      // Ensure question ends with ?
      return q.endsWith("?") ? q : q + "?";
    });
  }

  // Extract required SF-50 fields - capture everything until "OPM NOA Remarks" or end of string
  // Use a simpler approach: find the section and extract until the next major section
  let fieldsMatch = response.match(/Required SF-50 fields?:\s*([\s\S]*?)(?:\s*OPM NOA Remarks|$)/i);
  if (!fieldsMatch) {
    // Fallback: try to match until period or end
    fieldsMatch = response.match(/Required SF-50 fields?:\s*([\s\S]*?)(?:\.\s*(?:OPM|$)|$)/i);
  }
  
  if (fieldsMatch) {
    let fieldsText = fieldsMatch[1].trim();
    
    // Normalize whitespace - replace all whitespace (including newlines) with single spaces
    fieldsText = fieldsText.replace(/\s+/g, ' ');
    
    // Remove trailing period if present
    fieldsText = fieldsText.replace(/\.\s*$/, '');
    
    // Split by commas, semicolons, or "and" (be more conservative with splitting)
    // First try splitting by comma or semicolon
    let fields = fieldsText.split(/[,;]/);
    
    // If that didn't create multiple fields, try splitting by "and"
    if (fields.length === 1 && fieldsText.toLowerCase().includes(' and ')) {
      fields = fieldsText.split(/\s+and\s+/i);
    }
    
    // Clean up each field
    result.requiredSF50Fields = fields
      .map((f) => f.trim())
      .filter((f) => {
        // Filter out empty strings, standalone "and"/"or", and very short fragments (less than 2 chars)
        return f.length >= 2 && !f.match(/^(and|or)$/i);
      })
      .map((f) => {
        // Remove trailing periods and clean up
        return f.replace(/\.\s*$/, '').trim();
      });
  }

  // Extract OPM NOA Remarks - capture until end of string or next section
  const remarksMatch = response.match(/OPM NOA Remarks:\s*([\s\S]*?)(?:$|(?:\n\n|\n[A-Z][a-z]+:))/);
  if (remarksMatch) {
    result.opmRemarks = remarksMatch[1].trim().replace(/\s+/g, ' ');
  }

  // Extract remark codes if mentioned (e.g., "REA remark", "Authority remark codes")
  const remarkCodesMatch = response.match(/(?:remark codes?|remark code):\s*([^\.]+?)(?:\.|$)/i);
  if (remarkCodesMatch) {
    const codesText = remarkCodesMatch[1];
    result.remarkCodes = codesText
      .split(/[,;and]+/i)
      .map((c) => c.trim())
      .filter((c) => c.length > 0);
  }

  // Fallback: if no clarifications found, try a simpler pattern
  if (result.clarifications.length === 0) {
    const simpleClarMatch = response.match(/Clarifications:\s*([^\.]+)/i);
    if (simpleClarMatch) {
      const text = simpleClarMatch[1];
      result.clarifications = text
        .split(/\?+/)
        .map((c) => c.trim())
        .filter((c) => c.length > 0)
        .map((c) => (c.endsWith("?") ? c : c + "?"));
    }
  }

  return result;
}

