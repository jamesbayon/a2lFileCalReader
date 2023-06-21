/*
 ** Filename: script.js
 **
 ** Description: This is the javascript file used for a2L file reading
 ** and getting the callibration labels both READ_ONLY and NOT.
 **
 ** Author/s: Bayon-on James Mariano 6/12/2023
 **
 ** Created Date:6/12/2023
 **
 ** Last Modified Date:6/19/2023
 **
 */

/* ================ GLOBAL VARIABLES START ================ */

const gAllowedExtensions = ["a2l"];
const gAllowedCharacteristicBeginTag = [
  "/begin CHARACTERISTIC",
  "/begin AXIS_PTS",
];
const gAllowedCharacteristicEndTag = ["/end CHARACTERISTIC", "/end AXIS_PTS"];
const gReadOnlyTag = ["READ_ONLY"];

/* global var for file1 */
let gFileInputName1 = "";
let gReadOnlyList1 = [];
let gNotReadOnlyList1 = [];

/* ================ GLOBAL VARIABLES END ================ */

/* ============= FUNCTION DEFINITIONS START ============= */

// JavaScript to handle tab switching
function openTab(evt, tabName) {
  let i, tabcontent, tablinks;

  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }

  document.getElementById(tabName).style.display = "block";
  evt.currentTarget.className += " active";
}

// Set the default tab to open on page load
document.getElementById("defaultOpen").click();

// hide error message
const errorContainer = document.getElementById("errorContainer");
errorContainer.classList.add("hide");

// JavaScript to handle collapsible contents
let coll = document.getElementsByClassName("collapsible");
let i;
for (i = 0; i < coll.length; i++) {
  coll[i].addEventListener("click", function () {
    this.classList.toggle("activeCollapsible");
    let content = this.nextElementSibling;
    if (content.style.maxHeight) {
      content.style.maxHeight = null;
      this.querySelector(".collapsible-icon").textContent = "+";
    } else {
      content.style.maxHeight = content.scrollHeight + "px";
      this.querySelector(".collapsible-icon").textContent = "-";
    }
  });
}

function updateSelectedFileText1() {
  gFileInputName1 = updateSelectedFileText("fileInput1", "selectedFileText1");
  const readFileButton = document.getElementById("readFileBtn");
  const emptyValue = ["n/a", "N/A", "0"];

  if (gFileInputName1.length === 0 || gFileInputName1.includes(emptyValue)) {
    readFileButton.disabled = true;
  } else {
    readFileButton.disabled = false;
  }
}

function updateSelectedFileText(pFileInput, pSelectedFileText) {
  const fileInput = document.getElementById(pFileInput);
  const selectedFileText = document.getElementById(pSelectedFileText);
  selectedFileText.textContent = fileInput.files[0]
    ? `${fileInput.files[0].name}`
    : "";

  return selectedFileText.textContent;
}

function readFile1() {
  const fileInput = document.getElementById("fileInput1");
  const file = fileInput.files[0];

  if (fileInput == null) {
    showError("Error: File element is null");
  }

  resetFile1GlobalVars();

  readFile(file)
    .then(([readOnlyArr, notReadOnlyArr]) => {
      gReadOnlyList1 = [...readOnlyArr];
      gNotReadOnlyList1 = [...notReadOnlyArr];

      displayText("readOnlyCount1", gReadOnlyList1.length);
      displayText("notReadOnlyCount1", gNotReadOnlyList1.length);

      const saveROListButton = document.getElementById("readOnlySaveBtn");
      const saveNROListButton = document.getElementById("notReadOnlySaveBtn");

      if (gReadOnlyList1.length > 0) {
        saveROListButton.disabled = false;
      } else {
        saveROListButton.disabled = true;
      }

      if (gNotReadOnlyList1.length > 0) {
        saveNROListButton.disabled = false;
      } else {
        saveNROListButton.disabled = true;
      }

      gReadOnlyList1.sort();
      gNotReadOnlyList1.sort();

      displayList("readOnlyList1", gReadOnlyList1);
      displayList("notReadOnlyList1", gNotReadOnlyList1);
    })
    .catch((error) => {
      showError(error);
    });
}

function readFile(file) {
  return new Promise((resolve, reject) => {
    let readOnlyList = [];
    let notReadOnlyList = [];

    if (!validateFile(file)) {
      return;
    }

    const reader = new FileReader();

    reader.onload = function (event) {
      const fileContent = event.target.result;
      const lines = fileContent
        .split("\n")
        .filter((line) => line.trim() !== "");

      let isInsideCharacteristic = false;
      let isFirstLine = false;
      let isReadOnly = false;
      let callibrationLabel = "";

      lines.forEach((line) => {
        if (containsStringFromArray(line, gAllowedCharacteristicBeginTag)) {
          isInsideCharacteristic = true;
          return;
        } else if (
          containsStringFromArray(line, gAllowedCharacteristicEndTag)
        ) {
          isInsideCharacteristic = false;
        }

        if (isInsideCharacteristic) {
          if (!isFirstLine) {
            callibrationLabel = line;
            isFirstLine = true;
          }

          if (containsStringFromArray(line, gReadOnlyTag)) {
            isReadOnly = true;
          }
        }

        if (containsStringFromArray(line, gAllowedCharacteristicEndTag)) {
          if (isReadOnly) {
            readOnlyList.push(callibrationLabel);
          } else {
            notReadOnlyList.push(callibrationLabel);
          }

          callibrationLabel = "";
          isReadOnly = false;
          isFirstLine = false;
        }
      });

      resolve([readOnlyList, notReadOnlyList]);
    };

    reader.onerror = function () {
      reject(new Error("Error reading file."));
    };

    reader.readAsText(file);
  });
}

function containsStringFromArray(string, array) {
  return array.some((item) => string.includes(item));
}

function validateFile(file) {
  if (!file) {
    showError("Please select an a2L file.");
    return false;
  }

  const allowedExtensions = gAllowedExtensions;
  const fileExtension = getFileExtension(file.name);

  if (!allowedExtensions.includes(fileExtension)) {
    showError("Invalid file format. Please select an a2l file.");
    return false;
  }

  return true;
}

function getFileExtension(fileName) {
  return fileName.split(".").pop();
}

function showError(message) {
  const errorContainer = document.getElementById("errorContainer");
  errorContainer.textContent = message;
  errorContainer.classList.remove("hide");
  setTimeout(function () {
    errorContainer.classList.add("hide");
  }, 3000);
}

function displayText(elementId, textVal) {
  const textElement = document.getElementById(elementId);
  textElement.textContent = textVal;
}

function displayList(elementId, pList) {
  const listElement = document.getElementById(elementId);
  listElement.innerHTML = pList.map((line) => `<li>${line}</li>`).join("");
}

function resetFile1GlobalVars() {
  gReadOnlyList1 = [];
  gNotReadOnlyList1 = [];
}

function writeROListToFile() {
  writeArrayToFile(gReadOnlyList1, "file1ReadOnlyList");
}

function writeNROListToFile() {
  writeArrayToFile(gNotReadOnlyList1, "file1NotReadOnlyList");
}

function writeArrayToFile(array, filename) {
  array.sort();
  let text = array.map((item) => item.trim()).join("\n");

  let element = document.createElement("a");
  element.setAttribute(
    "href",
    "data:text/plain;charset=utf-8," + encodeURIComponent(text)
  );
  element.setAttribute("download", `${filename}.txt`);

  element.style.display = "none";
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

/* ============= FUNCTION DEFINITIONS END ============= */
