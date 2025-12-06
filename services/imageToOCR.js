// services/imageToOCR.js
import { exec } from "child_process";
import fs from "fs";
import path from "path";

export function imageToOCR(imagePath) {
  return new Promise((resolve, reject) => {
    const absolute = path.resolve(imagePath);
    const output = absolute + ".txt";

    // Build command
    const cmd = `tesseract "${absolute}" "${absolute}"`;

    console.log("RUNNING:", cmd);

    exec(cmd, (err) => {
      if (err) {
        console.error("Tesseract error:", err);
        return reject(err);
      }

      // Now read the .txt file generated
      try {
        const text = fs.readFileSync(output, "utf8");
        resolve(text);
      } catch (readError) {
        reject(readError);
      }
    });
  });
}
