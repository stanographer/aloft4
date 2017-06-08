var captionArea = document.getElementById('caption-area');
var previousText
var idle = true;
var didScroll, scrollLoop, scroller, mouseOver, count;
var scrollDelay = 4000;
var time = (scrollDelay/1000);

scrollEvent();
autoscroll('delayed-start');

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
		mouseOver = false;
	}
	return mouseOver;
}

function scrollEvent() {
	var lastScrollTop = 0;
	var delta = 30;
	// var navBarHeight = $('#header').outerHeight();

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
		var top = $(this).scrollTop();
	
		if (Math.abs(lastScrollTop - top) <= delta)
			return;
		// scroll down
		if (top > lastScrollTop) {
			$('#header').removeClass('nav-down').addClass('nav-up');
			$('.scrollToBottom').addClass('invisible').removeClass('visible');
			$('.navbar-fixed-top').addClass('top-nav-collapse');
		} else {
			// scroll up
			if (top + $(window).height() < $(document).height()) {
				$('#header').removeClass('nav-up').addClass('nav-down');
				$('.scrollToBottom').addClass('visible').removeClass('invisible');
				autoscroll('pause');
				// message.innerHTML = 'Autoscrolling paused!';
				clearInterval(count);
			}
		}
	lastScrollTop = top;
	}
}

function autoscroll(mode) {

	var scroll = function() {
		$(document).scrollTop($(document).height());
	}
	var startScroll = function() {
		scrollLoop = setInterval(scroll, 150);
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
    var textToWrite = document.getElementById("#caption-area").text();
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

// 

$(document).ready(function() {
    $('.navbar-nav [data-toggle="tooltip"]').tooltip();
    
    //Toggle for Sidebar
    $('.navbar-twitch-toggle').on('click', function(event) {
        event.preventDefault();
        $('.navbar-twitch').toggleClass('open');
    });
    
    $('.nav-style-toggle').on('click', function(event) {
        event.preventDefault();
        var $current = $('.nav-style-toggle.disabled');
        $(this).addClass('disabled');
        $current.removeClass('disabled');
        $('.navbar-twitch').removeClass('navbar-'+$current.data('type'));
        $('.navbar-twitch').addClass('navbar-'+$(this).data('type'));
    });
});