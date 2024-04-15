const csv = require("csv-parser");
const fs = require("fs");
const path = require("path");
const dataArray = [];
fs.createReadStream(path.resolve(__dirname, "test.csv"))
  .pipe(csv())
  .on("data", (data) => {
    dataArray.push(data);
  })
  .on("end", () => {
    const setOfFields = new Set();
    const countMapOfFields = new Map();
    dataArray.forEach((data) => {
      data.template.split(",").forEach((field) => {
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
    fs.writeFileSync(path.resolve(__dirname, "outputfields.csv"), csvData);
    const sortedFields = [...countMapOfFields.entries()].sort(
      (a, b) => b[1] - a[1]
    );
    //print the sorted fields in outputfieldsCounts.csv with 2 colums, first column is the field name and second column is the count of the field
    const outputDataCounts = ["Fields,Counts"].concat(
      sortedFields.map((field) => field.join(","))
    );
    const csvDataCounts = outputDataCounts.join("\n");
    fs.writeFileSync(
      path.resolve(__dirname, "outputfieldsCounts.csv"),
      csvDataCounts
    );
  });
