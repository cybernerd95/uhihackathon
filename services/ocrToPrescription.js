import fs from "fs";
import fetch from "node-fetch";

// Path to your OCR .txt file
const OCR_FILE_PATH = "D:/UHI API/sample/sample.jpg.txt";

// Read OCR text from file
function readOcrFile(filePath) {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch (err) {
    console.error("Failed to read OCR file:", err);
    return "";
  }
}

// Safely parse JSON from model output
function safeJsonParse(input) {
  // Remove code fences and junk
  let clean = input
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  // Extract JSON block between first { and last }
  const start = clean.indexOf("{");
  const end = clean.lastIndexOf("}");

  if (start !== -1 && end !== -1) {
    clean = clean.substring(start, end + 1);
  }

  try {
    return JSON.parse(clean);
  } catch (err) {
    console.error("FAILED TO PARSE JSON AFTER CLEANING:\n", clean);
    throw err;
  }
}

export async function extractPrescription() {
  const rawOcrText = readOcrFile(OCR_FILE_PATH);

  // Force model to output ONLY JSON
  const schema = `
You MUST return ONLY raw JSON.
No explanation. No comments. No extra text.

If something is missing, leave it empty or null.
Return EXACTLY this structure:

{
  "rawOcrText": "",
  "meds": {
    "current": {
      "medications": [
        {
          "name": "",
          "dosage": "",
          "frequency": "",
          "route": "",
          "duration": "",
          "instructions": "",
          "startDate": null,
          "endDate": null,
          "isCurrent": true,
          "dispensedByStaffId": null,
          "dispensedAt": null
        }
      ],
      "editedByUserId": null,
      "editedByRole": null,
      "editedAt": "${new Date().toISOString()}"
    },
    "history": []
  },
  "status": "UNVERIFIED"
}

RESPONSE MUST START WITH '{' AND END WITH '}'.
`;

  const prompt = `${schema}

Extract medication info from this OCR text:

${rawOcrText}
`;

  // Call Ollama
  const response = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "jsk/bio-mistral",
      prompt: prompt,
      stream: false,
      format: "json",
      options: {
        temperature: 0
      }
    })
  });

  const data = await response.json();

  console.log("RAW MODEL RESPONSE:\n", data.response);

  // Parse JSON
  let result = safeJsonParse(data.response);

  // Inject raw OCR text
  result.rawOcrText = rawOcrText;

  return result;
}
