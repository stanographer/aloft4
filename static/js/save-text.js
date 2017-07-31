// Save transcript function

function grabTranscript (user, event) {
    $.ajax({
        url: 'http://' + window.location.hostname + ':' + window.location.port + '/text/' + user + '/' + event,
        success: function (data) {
            saveForm(user, event, data);
        }
    });
}

function endForm() {
    var x = document.forms["namefile2"]["filename-id2"].value;
    if (x == null || x == "") {
        alert("Name must be filled out");
        return false;
    }
    saveTextAsFile(document.getElementById('filename-id').value);
    $('textarea').filter('[id*=pad]').val('');
}

function saveForm(user, event, data) {
    var filename = document.getElementById('filename-id').value;
    if (filename == null || filename == "") {
        alert("Name must be filled out");
        return false;
    }
    saveTextAsFile(user, event, data, filename);
}

function saveTextAsFile(user, event, data, filename) {
	var textToWrite;

	if (data) {
		textToWrite = data;
	} else {
		textToWrite = document.getElementById("#pad").text();
	}
// grab the content of the form field and place it into a variable
//  create a new Blob (html5 magic) that conatins the data from your form feild
    var textFileAsBlob = new Blob([textToWrite], {type:'text/plain'});
// Specify the name of the file to be saved
    var fileNameToSaveAs = filename + ".txt";

// Optionally allow the user to choose a file name by providing
// an imput field in the HTML and using the collected data here
// var fileNameToSaveAs = txtFileName.text;

// create a link for our script to 'click'
    var downloadLink = document.createElement("a");
//  supply the name of the file (from the var above).
// you could create the name here but using a var
// allows more flexability later.
    downloadLink.download = fileNameToSaveAs;
// provide text for the link. This will be hidden so you
// can actually use anything you want.
    downloadLink.innerHTML = "My Hidden Link";

// allow our code to work in webkit & Gecko based browsers
// without the need for a if / else block.
    window.URL = window.URL || window.webkitURL;

// Create the link Object.
    downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
// when link is clicked call a function to remove it from
// the DOM in case user wants to save a second file.
    downloadLink.onclick = destroyClickedElement;
// make sure the link is hidden.
    downloadLink.style.display = "none";
// add the link to the DOM
    document.body.appendChild(downloadLink);

// click the new link
    downloadLink.click();
}

function destroyClickedElement (event) {
	// remove the link from the DOM
    document.body.removeChild(event.target);
}