import { spawn } from "child_process";
import fs from "fs";

const exe = "D:\\UHI API\\whisper\\whisper.cpp\\build\\bin\\whisper-cli.exe";
const model = "D:\\UHI API\\whisper\\whisper.cpp\\ggml-base.en.bin";
const audio = "D:\\UHI API\\sample\\sample.mp3";
const output = audio + ".txt";

console.log("RUNNING WHISPER ...");

const child = spawn(
  `"${exe}"`,
  ["-m", `"${model}"`, "-f", `"${audio}"`, "-otxt"],
  {
    cwd: "D:\\UHI API\\whisper\\whisper.cpp\\build\\bin",
    shell: true
  }
);

child.stdout.on("data", data => console.log("STDOUT:", data.toString()));
child.stderr.on("data", data => console.log("STDERR:", data.toString()));

child.on("close", code => {
  console.log("PROCESS EXIT CODE:", code);

  if (code !== 0) {
    console.log("❌ Whisper failed.");
    return;
  }

  if (!fs.existsSync(output)) {
    console.log("❌ Output file not found:", output);
    return;
  }

  const text = fs.readFileSync(output, "utf8");
  console.log("\n🎉 TRANSCRIPT:\n");
  console.log(text);
});
