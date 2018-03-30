'use strict';

var captionArea = document.getElementById('caption-area');
var previousText
var count;

scroller();

var Autoscroll = (function () {
	var scrollLoop, scroller;
	let idle = true;

	var scroll = function() {
		// zenscroll.toY($(document).height(), 500);
		$(document).scrollTop($(document).height());
		$('#main-content').animate({
        	scrollTop: $(document).height()
    	}, 'slow');
	}
	var startScroll = function () {
		clearInterval(scrollLoop);
		scrollLoop = setInterval(scroll, 200);
		console.log('scrolling has started!');
	}
	var stopScroll = function() {
		clearInterval(scrollLoop);
		console.log('scrolling has stopped!');
	}
	return {
		startFirst: function () {
			startScroll();
		},
		start: function () {
			startScroll();
		},
		pause: function () {
			stopScroll();
		}
	}
})();

function scroller () {
	let lastScrollTop = 0;
	let tolerance = 50;

	function follow () {
		console.log('follow follow follow!');
		$('#header').removeClass('nav-down').addClass('nav-up');
		$('.dropdown').removeClass('open');
		$('#autoscroll').addClass('invisible').removeClass('visible');
		$('#main-content').css('margin-left', '0rem');
	}

	function pause () {
		console.log('pause pause pause!');
		$('#header').removeClass('nav-up').addClass('nav-down');
		$('#autoscroll').addClass('visible').removeClass('invisible');
		$('#main-content').css('margin-left', '3rem');
		// Autoscroll.pause();
	}

	let fired = false;

	$(document).ready(function () {
		follow();
	});

	$('#autoscroll').click(function (e) {
		e.stopPropagation();
		fired = false;
		Autoscroll.start();
		follow();
	});

	$('body').on('touchend wheel click', function () {
		if (fired === false) {
			Autoscroll.pause();
			pause();
			fired = true;
		}
	});
}


$(document).ready(function() {
    $('.navbar-nav [data-toggle="tooltip"]').tooltip();
    
    //Toggle for Sidebar
    $('.navbar-twitch-toggle').on('click', function (event) {
        event.preventDefault();
        $('.navbar-twitch').toggleClass('open');
    });
    
    $('.nav-style-toggle').on('click', function (event) {
        event.preventDefault();
        var $current = $('.nav-style-toggle.disabled');
        $(this).addClass('disabled');
        $current.removeClass('disabled');
        $('.navbar-twitch').removeClass('navbar-'+$current.data('type'));
        $('.navbar-twitch').addClass('navbar-'+$(this).data('type'));
    });
});

Autoscroll.start();