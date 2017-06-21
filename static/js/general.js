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