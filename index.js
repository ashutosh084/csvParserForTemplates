const writeToField = function (field) {
  document.getElementById("fields").innerText = field;
};

const writeToFieldCount = function (field) {
  document.getElementById("fieldCount").innerText = field;
};

const getFields = function () {
  const fields = document.getElementById("fields").innerText;
  return fields;
};

const getFieldCount = function () {
  const fieldCount = document.getElementById("fieldCount").innerText;
  return fieldCount;
};

function downloadFile(content, fileName, contentType) {
  // Create a Blob object with the file content
  var blob = new Blob([content], { type: contentType });

  // Create a link element
  var a = document.createElement("a");

  // Set the href and download attributes for the link
  a.href = URL.createObjectURL(blob);
  a.download = fileName;

  // Append the link to the body
  document.body.appendChild(a);

  // Simulate click to download the file
  a.click();

  // Remove the link from the body
  document.body.removeChild(a);
}

function processGridLayout(dataArray, isAdvSearchOrDetails = false) {
  const setOfFields = new Set();
  const countMapOfFields = new Map();
  dataArray.forEach((data) => {
    const layout = data.trim();
    layout.split(isAdvSearchOrDetails ? /[,|]/ : ",").forEach((field) => {
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
  writeToField(csvData);

  const sortedFields = [...countMapOfFields.entries()].sort(
    (a, b) => b[1] - a[1]
  );

  const outputDataCounts = ["Fields,Counts"].concat(
    sortedFields.map((field) => field.join(","))
  );

  const csvDataCounts = outputDataCounts.join("\n");
  writeToFieldCount(csvDataCounts);
}

function processSearchQuery(dataArray) {
  const splittedDataArray = dataArray.map((data) => {
    return data.split("\t");
  });

  const mapOfTypeVsSearch = new Map();

  splittedDataArray.forEach((data) => {
    const searchType = data[0];
    const search = data[1];
    mapOfTypeVsSearch[searchType]
      ? mapOfTypeVsSearch[searchType].push(search)
      : (mapOfTypeVsSearch[searchType] = [search]);
  });

  /**
   * {
   *    "type1": {
   *     "param1": 5,
   *     "param2": 10
   *    },
   * }
   */
  const mapOfTypeVsSearchParamCount = new Map();

  Object.keys(mapOfTypeVsSearch).forEach((searchType) => {
    const searchArray = mapOfTypeVsSearch[searchType];
    const searchParamCount = new Map();
    if (
      [
        "WorkList",
        "Open Items",
        "Invoices",
        "Applied Payments",
        "Email Inbox",
      ].some((type) =>
        searchType.toLocaleLowerCase().includes(type.toLocaleLowerCase())
      )
    ) {
      searchArray.forEach((search) => {
        try {
          const listOfParams = JSON.parse(search)?.["searchParams"];
          const parsedListOfparams = listOfParams
            ?.trim()
            ?.replace(/^\[/g, "")
            ?.replace(/\]$/g, "")
            ?.split(",");
          parsedListOfparams?.forEach((param) => {
            searchParamCount.set(param, (searchParamCount.get(param) || 0) + 1);
          });
        } catch (e) {
          console.log(e);
        }
      });
    } else {
      console.log("Invalid search type", searchType);
    }
    mapOfTypeVsSearchParamCount[searchType] = searchParamCount;
  });

  const mapOfSearchTypeVsOutputData = {};
  Object.keys(mapOfTypeVsSearchParamCount).forEach((searchType) => {
    let outputData = [];
    const searchParamCount = mapOfTypeVsSearchParamCount[searchType];
    const sortedSearchParamCount = [...searchParamCount.entries()].sort(
      (a, b) => b[1] - a[1]
    );
    outputData = outputData.concat(
      [`Fields,Counts`].concat(
        sortedSearchParamCount.map((field) => field.join(","))
      )
    );
    mapOfSearchTypeVsOutputData[searchType] = outputData.join("\n");
  });

  let outputString = "";

  Object.keys(mapOfSearchTypeVsOutputData).forEach((searchType) => {
    outputString += `<b>${searchType}</b>\n${mapOfSearchTypeVsOutputData[searchType]}\n\n`;
  });

  writeToField(outputString);
  writeToFieldCount("");
}

const processCsv = function () {
  const sourceText = document.getElementById("sourceFields").value;
  const dataArray = [];

  sourceText.split("\n").forEach((line) => {
    const data = line.replace(/\/\//g, "/");
    dataArray.push(data);
  });

  //check radio button selection of radio "layout"
  if (document.getElementById("gridLayout").checked) {
    processGridLayout(dataArray);
  } else if (document.getElementById("query").checked) {
    processSearchQuery(dataArray);
  } else if (document.getElementById("advSearchLayout").checked) {
    processGridLayout(dataArray, true);
  } else if (document.getElementById("detailsLayout").checked) {
    processGridLayout(dataArray, true);
  } else {
    alert("Please select a radio button");
  }
};

function createAndDownloadFile(index) {
  const fileNamePrefix = document.getElementById("fileNamePrefix").value;
  if (index == 0) {
    const fields = getFields();

    let fieldsFileName = "fields.csv";

    if (fileNamePrefix) {
      fieldsFileName = fileNamePrefix + "_" + fieldsFileName;
    }
    downloadFile(fields, fieldsFileName, "text/csv");
  } else if (index == 1) {
    const fieldCount = getFieldCount();

    let fieldCountFileName = "fieldCount.csv";

    if (fileNamePrefix) {
      fieldCountFileName = fileNamePrefix + "_" + fieldCountFileName;
    }
    downloadFile(fieldCount, fieldCountFileName, "text/csv");
  } else {
    window.alert("error");
  }
}

//default settings
//by default select the radio button with id gridLayout
document.getElementById("gridLayout").checked = true;
// //by default check the checkbox with id pasteFriendly
// document.getElementById("pasteFriendly").checked = true;

window.processCsv = processCsv;
window.createAndDownloadFile = createAndDownloadFile;
