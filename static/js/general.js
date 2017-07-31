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
	textarea.scrollTop = textarea.scrollHeight;
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
    });
});
