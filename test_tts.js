import { transcriptToSOAPFile } from "./services/transcriptToSOAP.js";

(async () => {
  try {
    const result = await transcriptToSOAPFile("D:/UHI API/sample/sample.jpg.txt");
    console.log("SOAP RESULT:\n", JSON.stringify(result, null, 2));
  } catch (err) {
    console.error(err);
  }
})();
