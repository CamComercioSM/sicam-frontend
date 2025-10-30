// resources/assets/config/datatables-defaults.js
import DataTable from 'datatables.net-bs5';

// (opcional) si quieres asegurarte de que Buttons esté cargado antes de tocar "buttons"
import 'datatables.net-buttons';
import 'datatables.net-buttons-bs5';

// 👇 Auxiliar para limpiar celdas con HTML (avatars, badges, etc.)
function limpiarContenidoCelda(inner) {
    if (!inner || inner.length <= 0) return inner;
    const el = $.parseHTML(inner);
    let res = '';
    $.each(el, function (_, item) {
        if (item.classList && item.classList.contains('user-name')) {
            res += item.lastChild?.firstChild?.textContent || '';
        } else {
            res += item.innerText || item.textContent || '';
        }
    });
    return res;
}

// 👇 Fábrica de botones: permite columnas y customize por tabla
window.makeExportButtons = function makeExportButtons({
    // Por defecto: exporta solo columnas visibles y sin la clase .no-export
    columns = ':visible:not(.no-export)',
    customizePrint = null // callback opcional por tabla
} = {}) {
    const common = {
        exportOptions: {
            columns,
            format: { body: limpiarContenidoCelda }
        }
    };

    return [
        {
            extend: 'collection',
            className: 'btn btn-outline-secondary dropdown-toggle me-4 waves-effect waves-light',
            text: '<i class="ri-download-line ri-16px me-1"></i> <span class="d-none d-sm-inline-block">Exportar</span>',
            buttons: [
                {
                    extend: 'print',
                    text: '<i class="ri-printer-line me-1"></i>Imprimir',
                    className: 'dropdown-item',
                    ...common,
                    customize: function (win) {
                        // Estilo base “seguro”
                        $(win.document.body)
                            .css({ color: '#000', 'background-color': '#fff' })
                            .find('table')
                            .addClass('compact')
                            .css('color', 'inherit');

                        // Permite que cada tabla agregue su propio customize
                        if (typeof customizePrint === 'function') {
                            customizePrint(win, this);
                        }
                    }
                },
                { extend: 'csv', text: '<i class="ri-file-text-line me-1"></i>CSV', className: 'dropdown-item', ...common },
                { extend: 'excel', text: '<i class="ri-file-excel-line me-1"></i>Excel', className: 'dropdown-item', ...common },
                { extend: 'pdf', text: '<i class="ri-file-pdf-line me-1"></i>PDF', className: 'dropdown-item', ...common },
                { extend: 'copy', text: '<i class="ri-file-copy-line me-1"></i>Copiar', className: 'dropdown-item', ...common }
            ]
        }
    ];
};

// ✅ Configuración global de DataTables (por defecto)
Object.assign(DataTable.defaults, {
    language: {
        emptyTable: 'No hay datos disponibles en la tabla',
        info: 'Mostrando _START_ a _END_ de _TOTAL_ registros',
        infoEmpty: 'Mostrando 0 a 0 de 0 registros',
        infoFiltered: '(filtrado de _MAX_ registros en total)',
        lengthMenu: 'Mostrar _MENU_ registros',
        loadingRecords: 'Cargando...',
        processing: 'Procesando...',
        search: 'Buscar:',
        zeroRecords: 'No se encontraron coincidencias',
        paginate: {
            next: '<i class="icon-base ri ri-arrow-right-s-line scaleX-n1-rtl icon-22px"></i>',
            previous: '<i class="icon-base ri ri-arrow-left-s-line scaleX-n1-rtl icon-22px"></i>',
            first: '<i class="icon-base ri ri-skip-back-mini-line scaleX-n1-rtl icon-22px"></i>',
            last: '<i class="icon-base ri ri-skip-forward-mini-line scaleX-n1-rtl icon-22px"></i>'
        }
    },
    // dom:
    //   "<'row mb-3'<'col-sm-12 col-md-6'l><'col-sm-12 col-md-6'f>>" +
    //   "<'table-responsive'tr>" +
    //   "<'row mt-3'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",
    // responsive: true,
    autoWidth: true,
    searching: true,
    ordering: true,
    processing: true,
    serverSide: true,
    pageLength: 50,
    lengthMenu: [5, 10, 25, 50, 100, 200, 500],
    engthMenu: [10, 25, 50, 100],
    // 👇 Botones por defecto (puedes sobrescribirlos por tabla)
    buttons: makeExportButtons()
});
console.log('✅ Configuración global de DataTables cargada');
