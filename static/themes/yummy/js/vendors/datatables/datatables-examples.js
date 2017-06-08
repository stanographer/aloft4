// ========================================================================
//	Datatables
// ========================================================================	


$(document).ready(function () {

    // Setup - add a text input to each footer cell
    $('#datatablesexample1 tfoot th').each(function () {
        var title = $('#datatablesexample1 thead th').eq($(this).index()).text();
        $(this).html('<input type="text" placeholder="Search ' + title + '" />');
    });

    // DataTable
    var table1 = $('#datatablesexample1').DataTable();

    // Apply the search
    table1.columns().eq(0).each(function (colIdx) {
        $('input', table1.column(colIdx).footer()).on('keyup change', function () {
            table1
                .column(colIdx)
                .search(this.value)
                .draw();
        });
    });


    var table2 = $('#datatablesexample2').DataTable({
        "paging": false,
        "searching": false
    });

    $('a.toggle-vis').on('click', function (e) {
        e.preventDefault();

        // Get the column API object
        var column = table2.column($(this).attr('data-column'));

        // Toggle the visibility
        column.visible(!column.visible());
    });

});
