// test.js
import { imageToOCR } from "./services/imageToOCR.js";

(async () => {
  try {
    const text = await imageToOCR("D:/UHI API/sample/sample.jpg");
    console.log("\nOCR RESULT:\n");
    console.log(text);
  } catch (err) {
    console.error("ERROR:", err);
  }
})();
