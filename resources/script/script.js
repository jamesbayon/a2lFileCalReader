function updateSelectedFileText() {
	const fileInput = document.getElementById("fileInput");
	const selectedFileText = document.getElementById("selectedFileText");
	selectedFileText.textContent = fileInput.files[0] ? `Selected File: ${fileInput.files[0].name}` : "No File Selected";
}
		
function readFile() {
    const fileInput = document.getElementById("fileInput");
    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
        const fileContent = e.target.result;
        const lines = fileContent.split("\n");

        let isInsideCharacteristic = false;
		let isFirstLineInsideCharacteristic = false;
		let isReadOnly = false;
        let readOnlyCount = 0;
        let notReadOnlyCount = 0;
        let totalCount = 0;
		let callibrationLabel = "";
		let trimmedLine = "";
        const readOnlyList = [];
        const notReadOnlyList = [];

        lines.forEach(line => {	

			/* determine if within CHARACTERISTIC tag */		
            if (line.includes("/begin CHARACTERISTIC")) {
                isInsideCharacteristic = true;
				return;
            } else if (line.includes("/end CHARACTERISTIC")) {
                isInsideCharacteristic = false;
            } 
			
			if ( isInsideCharacteristic && line.trim() !== '') {
				trimmedLine = line.trim();
				
				/* if within CHARACTERISTIC, get the first non-empty line */
				if ( !isFirstLineInsideCharacteristic ) {
					callibrationLabel = trimmedLine;
					isFirstLineInsideCharacteristic = true;
				}
				
				/* check if CHARACTERISTIC is READ_ONLY */
				if (trimmedLine.includes("READ_ONLY")) {
					isReadOnly = true;
				}
				
			}
			
			/* determine if end CHARACTERISTIC tag */
			if ( line.includes("/end CHARACTERISTIC") ) { 
				/* add to read only list  */
				if ( isReadOnly ) {
                    readOnlyCount++;
					totalCount++;
					readOnlyList.push(callibrationLabel);
					callibrationLabel = "";
					isReadOnly = false;
					isFirstLineInsideCharacteristic = false;
				} 
				/* add to not read only list  */
				else {
                    notReadOnlyCount++;
					totalCount++;
                    notReadOnlyList.push(callibrationLabel);
					callibrationLabel = "";
					isReadOnly = false;
					isFirstLineInsideCharacteristic = false;
				}
				
			}
			
        });
		
		const totalCountElement = document.getElementById("totalCount");
        totalCountElement.textContent = totalCount;
		
        const readOnlyCountElement = document.getElementById("readOnlyCount");
        readOnlyCountElement.textContent = readOnlyCount;

        const notReadOnlyCountElement = document.getElementById("notReadOnlyCount");
        notReadOnlyCountElement.textContent = notReadOnlyCount;

        const readOnlyListElement = document.getElementById("readOnlyList");
        readOnlyListElement.innerHTML = readOnlyList.map(line => `<li>${line}</li>`).join("");

        const notReadOnlyListElement = document.getElementById("notReadOnlyList");
        notReadOnlyListElement.innerHTML = notReadOnlyList.map(line => `<li>${line}</li>`).join("");
    };

    reader.readAsText(file);
}
