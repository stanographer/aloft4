var pad = document.getElementById('pad');
var captionArea = document.getElementById('caption-area');
var previousText
var idle = true;

setInterval(function () {
	paintCaptions();
}, 100);
scrollNavBar();
navBarMouseIsOver();

function paintCaptions() {
	if (previousText != pad.value) {
		var text = pad.value.replace(/\r\n|\n|\r/g, '<br />')
							.replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;');
		previousText = text;

		var htmlified = '<span class="captionText" id="captionText">' + text + '</span>';
		captionArea.innerHTML = htmlified;
	} else {
		return;
	}
}

function navBarMouseIsOver() {
	var mouseOver;
	var navbar = document.getElementById('navbar-main');
	navbar.onmouseover = function() {
		mouseOver = true;
	}
	navbar.onmouseout = function() {
		mouseOver = false;
	}
	return mouseOver;
}

function autoscroll (hey) {
	var count, scrollLoopId;
	var idleTimer = null;
	var idleWait = 3000;
	var time = 3 + 1;

	var scroll = function() {
		$(document).scrollTop($(document).height());
		console.log('scrolling has started again!');
	}

	var startScroll = function() {
		scrollLoopId = setInterval(scroll, 500);
	}

	var stopScroll = function() {
		clearInterval(scrollLoopId);
		console.log('scrolling has stopped!');
	}

	var countdown = function() {
		time = time - 1;
		document.getElementById('message').innerHTML = '';

		console.log(time);
		if (time <= 0) {
			clearInterval(count);
			time = 4;
			return;
		}
		var message = document.getElementById('message');
		message.innerHTML = 'Autoscrolling paused! Restarting in ' + time + '.';
	}

	if (hey === 'on') {
		startScroll();
		idle = true;
	}

	if (hey === 'off') {
		if (idle === true) {
	 				stopScroll();
	 				clearInterval(count);
	 				count = setInterval(countdown, 1000);
	 	}
	}

	if (hey === 'delayed-on') {
		clearTimeout(idleTimer);
		console.log(idle)
	 	if (!idle) {
	 		idleTimer = setTimeout(function () { 
					// Idle Event
					stopScroll();
					startScroll();
					
					
				}, idleWait);
	        	console.log(idle);
	 	}
	 		stopScroll();
	 		clearInterval(count);
	 		count = setInterval(countdown, 1000);

	} else {
		// // Starts the autoscroll when page loads.
		// idleTimer = setTimeout(function () { 
		// 	// Idle Event
		// 	startScroll(); 
		// 	idle = true;
		// }, idleWait);
	}
}

// Shows the navbar when scrolling up and stops autoscroll.
function scrollNavBar() {
	var didScroll;
	var navbarHeight = $('header').outerHeight();
	var navbar = document.getElementById('navbar-main');
	var lastScrollTop = 0;
	var delta = 3;

	$(window).scroll(function(event){
	    didScroll = true;
	});

	setInterval(function() {
	    if (didScroll) {
	        hasScrolled();
	        didScroll = false;
	    }
	}, 250);

	function hasScrolled() {
	    var st = $(this).scrollTop();
	    
	    // Make sure they scroll more than delta
	    if(Math.abs(lastScrollTop - st) <= delta)
	        return;
	    // If they scrolled down and are past the navbar, add class .nav-up.
	    // This is necessary so you never see what is "behind" the navbar.
	    if (st > lastScrollTop && st > navbarHeight){
	        // Scroll Down
	        hideNav();
	    } else {
	        // Scroll Up
	        document.getElementById('message').innerHTML = 'Autoscrolling paused!';
	        if (st + $(window).height() < $(document).height()) {
	            showNav();
	            idle = false;
	            autoscroll('delayed-on');
	        }
	    }
	    lastScrollTop = st;
	}
}

function hideNav() {
	$('#header').removeClass('nav-down').addClass('nav-up');
}

function showNav() {
	$('#header').removeClass('nav-up').addClass('nav-down');
}

// function paintCaptions () {
// 	if (pad.value.match(/\n\s*\n/)) {
// 		var para = document.createElement('p');
// 		var node = document.createTextNode(pad.value);
// 		para.appendChild(node);
// 		captionArea.appendChild(para);
// 		previousText = pad.value;
// 		console.log(previousText)
// 	} else {
// 		return;
// 	}
// }