// Tooltips

if ($('.tooltiped').length) {
	$('.tooltiped').tooltip({
        trigger : 'hover'
    });
}

// Popover

if ($('.popovered').length) {
    $('.popovered').popover({
        'html': 'true'
    });
}

// Dropdowns

$('.dropdown-menu').click(function (event) {
	event.stopPropagation();
});

// Scroll to bottom of editor

function jumpToBottom () {
	var textarea = document.getElementById('pad');
    $('#pad').animate({ scrollTop: textarea.scrollHeight }, 'slow');
}

// Scroll to top of editor


function jumpToTop () {
    $('#pad').animate({ scrollTop: 0 }, 'slow');
}

// Clipboard

$(document).ready(function () {
    new Clipboard('.cbcopy');
});

// Text Area

 // $('#pad').highlightTextarea({
 //    words: ['this', 'the'],
 //    color: '#d0bfff'
 //  });

 $(document).ready(function () {
    //Toggle fullscreen
    $(".fullscreen-button").click(function (e) {
        e.preventDefault();
        $('.editor-wrapper').addClass('panel-fullscreen');
        $('.compress-button').css('visibility', 'visible');
    });
    $(".compress-button").click(function (e) {
        e.preventDefault();
        $('.editor-wrapper').removeClass('panel-fullscreen');
        $('.compress-button').css('visibility', 'hidden');
    });
});
