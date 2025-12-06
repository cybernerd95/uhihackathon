import fs from "fs";
import fetch from "node-fetch";

const OCR_FILE_PATH = "D:/UHI API/sample/sample.jpg.txt";

// Read OCR
function readOcrFile(filePath) {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch (err) {
    console.error("Failed to read OCR file:", err);
    return "";
  }
}

// Safe JSON parse
function safeJsonParse(input) {
  let clean = input
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  const start = clean.indexOf("{");
  const end = clean.lastIndexOf("}");
  if (start !== -1 && end !== -1) {
    clean = clean.substring(start, end + 1);
  }

  try {
    return JSON.parse(clean);
  } catch (err) {
    console.error("FAILED TO PARSE JSON:\n", clean);
    throw err;
  }
}

export async function extractPrescription() {
  const rawOcrText = readOcrFile(OCR_FILE_PATH);

  const schema = `
You MUST output ONLY raw JSON.
Do not add explanation text.

IF MORE THAN ONE MEDICINE EXISTS:
RETURN ONE OBJECT PER MEDICINE INSIDE "medications" ARRAY.
DO NOT MERGE THEM.

Auto-correct medicine name spelling when obvious.
(Example: "Amolxylin" → "Amoxicillin")

OUTPUT MUST EXACTLY MATCH THIS STRUCTURE:

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
        },
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

Response MUST start with "{" and end with "}".
`;

  const prompt = `${schema}

Extract medication info from this OCR text:

${rawOcrText}
`;

  const response = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "jsk/bio-mistral",
      prompt,
      stream: false,
      format: "json",
      options: { temperature: 0 }
    })
  });

  const data = await response.json();
  console.log("RAW MODEL RESPONSE:\n", data.response);

  let result = safeJsonParse(data.response);

  // Inject original OCR text
  result.rawOcrText = rawOcrText;

  return result;
}
