import { intro, outro, text, isCancel, cancel } from "@clack/prompts";
import fs from "fs";
import path from "path";
import Papa from "papaparse";
import { convertRow } from "./utils.js";

const promptQuestion = async ({ message, placeholder, defaultValue }) => {
  const result = await text({
    message,
    placeholder,
    defaultValue,
  });

  if (isCancel(result)) {
    cancel("Operation cancelled");
    return process.exit(0);
  }

  return result;
};

const main = async () => {
  intro("Evionica to Capzlog Node");
  const picName = await promptQuestion({
    message: "Enter your name to be able to determine PIC, SPIC, PICUS time",
    placeholder: "John Doe",
    defaultValue: "John Doe",
  });

  const dpeName = await promptQuestion({
    message: "Enter your DPE's name to be able to mark your first PIC time",
    placeholder: "DPE Name",
    defaultValue: "DPE Name",
  });

  const fileName = await promptQuestion({
    message:
      "Enter the input file path (leave empty for 'source.csv' in current folder)",
    placeholder: "./example_source.csv",
    defaultValue: "./example_source.csv",
  });

  const outputFileName = await promptQuestion({
    message:
      "Enter the output file path (leave empty for 'output.csv' in current folder)",
    placeholder: "./output.csv",
    defaultValue: "./output.csv",
  });

  const sourceFilePath = fileName;
  const outputFilePath = outputFileName;

  const fileExists = fs.existsSync(path.resolve(sourceFilePath));

  if (!fileExists) {
    cancel(`File ${sourceFilePath} does not exist`);
    return process.exit(0);
  }

  const fileContent = fs.readFileSync(sourceFilePath, "utf8");
  const csvData = Papa.parse(fileContent, {
    header: true,
    skipEmptyLines: true,
  });

  const outputRows = csvData.data.map((row) =>
    convertRow(row, picName, dpeName)
  );

  const csvOutput = Papa.unparse(outputRows);
  fs.writeFileSync(outputFilePath, csvOutput);

  outro("CSV conversion successful! 🛫");
};

main();
