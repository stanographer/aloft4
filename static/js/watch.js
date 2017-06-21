'use strict';

var captionArea = document.getElementById('caption-area');
var previousText
var idle = true;
var count;

scroller();

var Autoscroll = (function () {
	var scrollLoop, scroller;

	var scroll = function() {
		// $(document).scrollTop($(document).height());
		$('html, body').animate({
        	scrollTop: $(document).height()
    	}, 'slow');
	}
	var startScroll = function() {
		scrollLoop = setInterval(scroll, 1300);
		console.log('scrolling has started!');
	}
	var stopScroll = function() {
		clearInterval(scrollLoop);
		console.log('scrolling has stopped!');
	}
	return {
		start: function () {
			scroller = setTimeout(startScroll, 0);
		},
		delayedStart: function () {
			scroller = setTimeout(startScroll, 1600);
		},
		restart: function () {
			scroller = setTimeout(startScroll, 3000);
		},
		pause: function () {
			clearTimeout(scroller);
			stopScroll();
		}
	}
})();

function scroller () {
	var lastScrollTop = 0;
	var tolerance = 200;
	var movedMouse = false;

	function follow () {
		$('#header').removeClass('nav-down').addClass('nav-up');
		// $('#main-content').removeClass('content-nav-open').addClass('content-nav-closed');
		$('.dropdown').removeClass('open');
		$('#autoscroll').addClass('invisible').removeClass('visible');
	}

	function pause () {
		$('#header').removeClass('nav-up').addClass('nav-down');
		$('#autoscroll').addClass('visible').removeClass('invisible');
		// $('#main-content').removeClass('content-nav-closed').addClass('content-nav-open');
		Autoscroll.pause();
		clearInterval(count);
	}


	$('#autoscroll').click(function () {
		Autoscroll.start();
	});

	$(window).scroll(function(e) {
    	var body = $('body')[0];
    	var scrollTop = body.scrollTop;
    	// console.log('scrolltop ' + scrollTop)
    	// console.log('lastscroll ' + lastScrollTop)
    	// console.log('innerheight ' + window.innerHeight)
    	// console.log('bodyscrollheight ' + body.scrollHeight)
	    if (scrollTop > lastScrollTop) {
	        if (scrollTop > (body.scrollHeight - window.innerHeight - tolerance)) {
	            follow();
	        }
	    } else {
    		if (scrollTop < (body.scrollHeight - window.innerHeight - tolerance)) {
           		pause();
        	}
    	}
    	lastScrollTop = scrollTop;
	});
}

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

function destroyClickedElement (event) {
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

Autoscroll.delayedStart();