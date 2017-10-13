// Tooltips

if ($('.tooltiped').length) {
	$('.tooltiped').tooltip();
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
    $("#panel-fullscreen").click(function (e) {
        e.preventDefault();
        
        var $this = $(this);
    
        if ($this.children('i').hasClass('fa-expand')) {
            $this.children('i').removeClass('fa-expand');
            $this.children('i').addClass('fa-compress');
        }
        $('.editor-wrapper').toggleClass('panel-fullscreen');
        $('body, html').toggleClass('overflow-hidden overflow-scroll');
    });
});
