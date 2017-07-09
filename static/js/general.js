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