import fs from "fs";
import path from "path";

const processCsv = function () {
  const sourceText = document.getElementById("sourceFields").value;
  const dataArray = [];

  sourceText.split("\n").forEach((line) => {
    const data = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
    dataArray.push(data);
  });

  const setOfFields = new Set();
  const countMapOfFields = new Map();
  dataArray.splice(0, 1);
  dataArray.forEach((data) => {
    const layout = data[4].trim().replace(/^"/g, "").replace(/"$/g, "");
    layout.split(",").forEach((field) => {
      setOfFields.add(field.split(":")[0]);
      countMapOfFields.set(
        field.split(":")[0],
        (countMapOfFields.get(field.split(":")[0]) || 0) + 1
      );
    });
  });

  const fieldsArray = Array.from(setOfFields);
  const outputData = fieldsArray.map((field) => [field]);
  const csvData = ["Fields"]
    .concat(outputData.map((row) => row.join(",")))
    .join("\n");

  //   fs.writeFileSync(path.resolve(__dirname, "outputfields.csv"), csvData);
  document.getElementById("fields").innerText = csvData;

  const sortedFields = [...countMapOfFields.entries()].sort(
    (a, b) => b[1] - a[1]
  );

  const outputDataCounts = ["Fields,Counts"].concat(
    sortedFields.map((field) => field.join(","))
  );

  const csvDataCounts = outputDataCounts.join("\n");

  //   fs.writeFileSync(
  //     path.resolve(__dirname, "outputfieldsCounts.csv"),
  //     csvDataCounts
  //   );
  document.getElementById("fieldCount").innerText = csvDataCounts;
};

window.processCsv = processCsv;
