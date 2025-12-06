// services/soapToLHP.js
import { vertex } from "../google.js";

export async function soapToLHP(soapObject) {
  const model = vertex.getGenerativeModel({ model: "gemini-1.5-pro" });

  const prompt = `
Convert the following SOAP JSON into an LHP (Longitudinal Health Plan).
Make it structured, readable, and medically accurate.

SOAP:
${JSON.stringify(soapObject, null, 2)}
`;

  const result = await model.generateContent(prompt);
  return {
    lhp: result.response.text()
  };
}
