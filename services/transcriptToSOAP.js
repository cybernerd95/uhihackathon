import fs from "fs";
import fetch from "node-fetch";

function readTranscript(path) {
  try {
    return fs.readFileSync(path, "utf8");
  } catch {
    return "";
  }
}

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

  return JSON.parse(clean);
}

export async function transcriptToSOAPFile(filePath) {
  const transcript = readTranscript(filePath);

  const schema = `
You MUST return ONLY raw JSON.

Extract SOAP from the transcript using these rules:

- subjective: Patient symptoms, complaints, what patient said.
- objective: Measurements, vitals, labs, tests, observations.
- assessment: Diagnosis or clinical interpretation.
- plan: Treatment, medication, follow-up, advice, next steps.

If a field is missing, return empty string "".

Return EXACTLY this structure:

{
  "soap": {
    "current": {
      "subjective": "",
      "objective": "",
      "assessment": "",
      "plan": "",
      "editedByUserId": null,
      "editedByRole": null,
      "editedAt": "${new Date().toISOString()}"
    },
    "history": []
  }
}

RESPONSE MUST START WITH '{' AND END WITH '}'.
`;

  const prompt = `${schema}

Convert this transcript into SOAP format:

${transcript}
`;

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

  const result = safeJsonParse(data.response);
  result.transcript = transcript;

  return result;
}