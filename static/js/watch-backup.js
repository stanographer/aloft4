var pad = document.getElementById('pad');
var captionArea = document.getElementById('caption-area');
var message = document.getElementById('message');
var previousText
var idle = true;
var didScroll, scrollLoop, scroller, mouseOver, count;
var scrollDelay = 4000;
var time = (scrollDelay/1000);

var captions = setInterval(function () {
	paintCaptions();
}, 100);
scrollEvent();
autoscroll('delayed-start');

function paintCaptions() {
	if (previousText != pad.value) {
		var text = pad.value.replace(/\r\n|\n|\r/g, '<br />')
							.replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;')
							.replace(/≈/g, '');
		previousText = text;

		var htmlified = '<span class="captionText" id="captionText">' + text + '</span>';
		captionArea.innerHTML = htmlified;
	} else {
		return;
	}
}

function navBarMouseIsOver() {
	var navbar = document.querySelectorAll('#header, #font-size, #navbar-main');
	navbar.onmouseover = function() {
		clearInterval(scrollLoop);
		clearTimeout(scroller);
		clearInterval(count);
		message.innerHTML = 'Autoscrolling paused! Remove cursor from menu to resume.';
		mouseOver = true;
	}
	navbar.onmouseout = function() {
		autoscroll('restart');
		clearInterval(count);
		count = setInterval(countdown, 1000);
		mouseOver = false;
	}
	return mouseOver;
}

function scrollEvent() {
	var lastScrollTop = 0;
	var delta = 15;
	var navBarHeight = $('#header').outerHeight();

	$(window).scroll(function(event) {
		didScroll = true;
	});

	setInterval(function() {
		if (didScroll) {
			hasScrolled();
			didScroll = false;
		}
	}, 100);

	function hasScrolled() {
		var st = $(this).scrollTop();
	
		if (Math.abs(lastScrollTop - st) <= delta)
			return;
		// scroll down
		if (st > lastScrollTop && st > navBarHeight) {
			$('#header').removeClass('nav-down').addClass('nav-up');
			$('.scrollToBottom').addClass('invisible').removeClass('visible');
			$('.navbar-fixed-top').addClass('top-nav-collapse');
		} else {
			// scroll up
			if (st + $(window).height() < $(document).height()) {
				$('#header').removeClass('nav-up').addClass('nav-down');
				$('.scrollToBottom').addClass('visible').removeClass('invisible');
				autoscroll('pause');
				// message.innerHTML = 'Autoscrolling paused!';
				clearInterval(count);
				clearInterval(captions);
				count = setInterval(countdown, 1000);
			}
		}
	lastScrollTop = st;
	}
}

var countdown = function() {
		// time = time - 1;
		// message.innerHTML = '';
		// console.log(time);
		// if (time <= 0) {
		// 	clearInterval(count);
		// 	time = (scrollDelay/1000);
		// 	return;
		// }
		// message.innerHTML = 'Autoscrolling paused! Restarting in ' + time + '.';
	}

function autoscroll(mode) {

	var scroll = function() {
		$(document).scrollTop($(document).height());
	}
	var startScroll = function() {
		scrollLoop = setInterval(scroll, 500);
		console.log('scrolling has started!');
	}
	var stopScroll = function() {
		clearInterval(scrollLoop);
		console.log('scrolling has stopped!');
	}
	if (mode === 'start') {
		scroller = setTimeout(startScroll, 0);
	}
	if (mode === 'delayed-start') {
		scroller = setTimeout(startScroll, 2000);
	}
	if (mode === 'restart') {
		scroller = setTimeout(startScroll, 3000);
	}
	if (mode === 'pause') {
		clearTimeout(scroller);
		clearInterval(scrollLoop);
		stopScroll();
	} else {
		// scroller = setTimeout(startScroll, 3000);
	}
}

// Restart scrolling

$('#autoscroll').click(function () {
	autoscroll('start');
	captions = setInterval(function () {
		paintCaptions();
	}, 100);
	// captions = setInterval(function () {
	// 	paintCaptions();
	// }, 100);
});

// Tooltips

if ($('.tooltiped').length) {
	$('.tooltiped').tooltip();
}


// Annotator

// var ann = new Annotator(document.body);

// Prevent dropdown close on click

$('.dropdown-menu').click(function (event) {
	event.stopPropagation();
});

// Save transcript function

function endForm() {
    var x = document.forms["namefile2"]["filename-id2"].value;
    if (x == null || x == "") {
        alert("Name must be filled out");
        return false;
    }
    saveTextAsFile(document.getElementById('filename-id').value);
    $('textarea').filter('[id*=pad]').val('');
}

function saveForm() {
    var x = document.getElementById('filename-id').value;
    if (x == null || x == "") {
        alert("Name must be filled out");
        return false;
    }
    saveTextAsFile(document.getElementById('filename-id').value);
}

function saveTextAsFile(name)
{
// grab the content of the form field and place it into a variable
    var textToWrite = document.getElementById("pad").value;
//  create a new Blob (html5 magic) that conatins the data from your form feild
    var textFileAsBlob = new Blob([textToWrite], {type:'text/plain'});
// Specify the name of the file to be saved
    var fileNameToSaveAs = name + ".txt";

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

function destroyClickedElement(event)
{
// remove the link from the DOM
    document.body.removeChild(event.target);
}