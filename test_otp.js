import { extractPrescription } from "./services/ocrToPrescription.js";

(async () => {
  try {
    const result = await extractPrescription();
    console.log("RESULT:\n", JSON.stringify(result, null, 2));
  } catch (err) {
    console.error("ERROR:", err);
  }
})();
