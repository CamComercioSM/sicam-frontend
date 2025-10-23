/**
 * Limpia y normaliza la respuesta JSON usada por DataTables.
 * 
 * @param {Object} json - Respuesta original del servidor.
 * @returns {Array} - Devuelve siempre un array válido para DataTables.
 */
window.limpiarRespuestaDataTable = function (json) {
    if (!json || typeof json !== 'object') json = {};

    // Asegurar que recordsTotal y recordsFiltered sean numéricos
    json.recordsTotal = Number.isFinite(json.recordsTotal) ? json.recordsTotal : 0;
    json.recordsFiltered = Number.isFinite(json.recordsFiltered) ? json.recordsFiltered : 0;

    // Evitar errores si data viene vacía o mal definida
    json.data = Array.isArray(json.data) ? json.data : [];

    return json.data;
}

// Archivo global de renderizadores de DataTables
// Cada función se define directamente en window
// y usa prefijo renderColumna para evitar colisiones

// ===== Utilidades internas =====
window.escapeHtml = function (s) {
    return String(s ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
};

window.avatarHtml = function (baseUrl, image) {
    if (!image) return '';
    return `<img src="${baseUrl}${image}" alt="Foto de perfil" class="rounded-circle">`;
};

const roleIcon = {
    Asesor: '<i class="icon-base ri ri-user-line icon-22px text-primary me-2"></i>',
    Administrador: '<i class="icon-base ri ri-vip-crown-line icon-22px text-warning me-2"></i>',
    Presidencia: '<i class="icon-base ri ri-pie-chart-line icon-22px text-success me-2"></i>',
    Invitado: '<i class="icon-base ri ri-edit-box-line icon-22px text-info me-2"></i>',
    Soporte: '<i class="icon-base ri ri-computer-line icon-22px text-danger me-2"></i>'
};

const estadoIcon = {
    activo: '<i class="icon-base ri ri-user-line icon-22px text-primary me-2"></i>',
    desactivo: '<i class="icon-base ri ri-vip-crown-line icon-22px text-warning me-2"></i>',
    borrado: '<i class="icon-base ri ri-pie-chart-line icon-22px text-success me-2"></i>'
};

window.formatDateDefault = function (iso) {
    try {
        const d = new Date(iso);
        if (isNaN(d)) return '-';
        const dd = String(d.getDate()).padStart(2, '0');
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const yyyy = d.getFullYear();
        return `${dd}/${mm}/${yyyy}`;
    } catch {
        return '-';
    }
};

// ===== Renderizadores globales =====

window.renderColumnaControl = function () {
    return '';
};

window.renderColumnaCheckbox = function () {
    return '<input type="checkbox" class="dt-checkboxes form-check-input">';
};

window.renderColumnaId = function (data, type, full) {
    return `<span>${escapeHtml(full?.id)}</span>`;
};

window.renderColumnaUsuario = function (data, type, full, meta, ctx = {}) {
    const { baseUrl = '', userView = '' } = ctx;
    const name = escapeHtml(full?.name);
    const email = escapeHtml(full?.email);
    const image = full?.userProfilePhoto;
    const avatar = avatarHtml(baseUrl, image);

    return (
        '<div class="d-flex justify-content-start align-items-center user-name">' +
        '<div class="avatar-wrapper">' +
        '<div class="avatar avatar-sm me-4">' + avatar + '</div>' +
        '</div>' +
        '<div class="d-flex flex-column">' +
        `<a href="${userView}/${full?.id}" class="text-heading text-truncate"><span class="fw-medium">${name}</span></a>` +
        `<small>${email}</small>` +
        '</div>' +
        '</div>'
    );
};

window.renderColumnaIdentificacion = function (data, type, full) {
    const identificacion = escapeHtml(full?.identificacion);
    return (
        '<span class="d-flex align-items-center">' +
        '<i class="icon-base ri ri-id-card-line"></i> ' +
        `<span>${identificacion}</span>` +
        '</span>'
    );
};

window.renderColumnaEmailVerificado = function (data, type, full, meta, ctx = {}) {
    const formatDate = ctx.formatDate || formatDateDefault;
    const email_verified_at = full?.email_verified_at;

    if (email_verified_at && email_verified_at !== 'null') {
        const formatted = escapeHtml(formatDate(email_verified_at));
        const icon = '<i class="icon-base ri ri-mail-check-fill text-success icon-22px text-primary me-2"></i>';
        return (
            '<span class="d-flex align-items-center">' +
            icon +
            `<span>${formatted}</span>` +
            '</span>'
        );
    } else {
        const icon = '<i class="icon-base ri fs-4 ri-shield-line text-danger icon-22px text-primary me-2"></i>';
        return (
            '<span class="d-flex align-items-center">' +
            icon +
            '<span>No verificado</span>' +
            '</span>'
        );
    }
};

window.renderColumnaUserRole = function (data, type, full) {
    const userRole = full?.userRole;
    if (!userRole || userRole === 'null') {
        return "<span class='text-truncate d-flex align-items-center text-heading'>-</span>";
    }
    const icon = roleIcon[userRole] || '';
    return `<span class='text-truncate d-flex align-items-center text-heading'>${icon}${escapeHtml(userRole)}</span>`;
};

window.renderColumnaEstado = function (data, type, full) {
    const estado = full?.estado;
    if (!estado || estado === 'null') {
        return "<span class='text-truncate d-flex align-items-center text-heading'>-</span>";
    }
    const icon = estadoIcon[estado] || '';
    return `<span class='text-truncate d-flex align-items-center text-heading'>${icon}${escapeHtml(estado)}</span>`;
};

window.renderColumnaAcciones = function (data, type, full, meta, ctx = {}) {
    if (typeof ctx.accionesTabla === 'function') {
        return ctx.accionesTabla(full);
    }
    return (
        '<div class="d-flex align-items-center">' +
        '<button type="button" class="btn btn-sm btn-icon btn-text-secondary rounded-pill" title="Acción">⋯</button>' +
        '</div>'
    );
};

window.withCtx = function (fn, ctx) {
    return (data, type, full, meta) => fn(data, type, full, meta, ctx);
};


window.accionesTablas = function (full) {

    return `
        <div class="d-flex align-items-center">
          <a href="javascript:;" data-id="${full['id']}" data-name="${full['name']}" class="btn btn-sm btn-icon btn-text-secondary rounded-pill waves-effect delete-record"><i class="icon-base ri ri-delete-bin-7-line icon-22px"></i></a>
          <button
            type="button"
            class="btn btn-icon btn-text-secondary btn-sm rounded-pill view-record"
            data-id="${full['id']}"
            data-name="${full['name']}"
          >
          <i class="icon-base ri ri-eye-line icon-22px"></i>
          </button>          
          <a href="javascript:;" class="btn btn-sm btn-icon btn-text-secondary rounded-pill dropdown-toggle hide-arrow p-0 waves-effect" data-bs-toggle="dropdown"><i class="icon-base ri ri-more-2-line icon-22px"></i></a>
          <div class="dropdown-menu dropdown-menu-end m-0">
            <a href="javascript:;" data-id="${full['id']}" data-name="${full['name']}" class="dropdown-item edit-role-user">Editar</a>
            <a href="javascript:;" class="dropdown-item">Suspender</a>
          </div>
        </div>
      `;
}


/**
 * helpers/datatables.layout.builder.global.js
 * Constructor genérico de layout para DataTables
 * Uso: const layout = construirDataTableLayout(cfgTopStart, cfgTopEnd, cfgBottomStart, cfgBottomEnd);
 */
// ---------- Utilidades seguras (no colisionan si ya existen) ----------

window.dtBodyFormatter = function (inner) {
    if (!inner || inner.length <= 0) return inner;
    if (inner.indexOf('<') === -1) return inner;

    const parser = new DOMParser();
    const doc = parser.parseFromString(inner, 'text/html');

    const nameBlocks = doc.querySelectorAll('.role-name, .user-name');
    if (nameBlocks.length > 0) {
        let text = '';
        nameBlocks.forEach(el => {
            const nameText =
                el.querySelector('.fw-medium')?.textContent ||
                el.querySelector('.d-block')?.textContent ||
                el.textContent;
            text += (nameText || '').trim() + ' ';
        });
        return text.trim();
    }
    return (doc.body.textContent || doc.body.innerText || '').trim();
};


if (typeof window.buildExportOptions !== 'function') {
    window.buildExportOptions = function (columns, bodyFormatter) {
        const formatter = bodyFormatter || window.dtBodyFormatter;
        return {
            columns,
            format: {
                body: function (inner /*, colIdx, rowIdx */) {
                    return formatter(inner);
                }
            }
        };
    };
}

// Botones de exportación parametrizables
if (typeof window.buildExportButtons !== 'function') {
    window.buildExportButtons = function ({
        columns = [],
        classNameItem = 'dropdown-item',
        customizePrint // opcional: function (win) {}
    } = {}) {
        const safeCustomize = function (win) {
            // Personalización por defecto (opcional)
            try {
                if (typeof customizePrint === 'function') {
                    customizePrint(win);
                    return;
                }
                // Fallback común si existe config.colors
                if (window.config?.colors) {
                    win.document.body.style.color = config.colors.headingColor;
                    win.document.body.style.borderColor = config.colors.borderColor;
                    win.document.body.style.backgroundColor = config.colors.bodyBg;
                    const table = win.document.body.querySelector('table');
                    if (table) {
                        table.classList.add('compact');
                        table.style.color = 'inherit';
                        table.style.borderColor = 'inherit';
                        table.style.backgroundColor = 'inherit';
                    }
                }
            } catch (e) {
                // no romper
            }
        };

        const opts = window.buildExportOptions(columns);

        return [
            {
                extend: 'print',
                text: `<span class="d-flex align-items-center"><i class="icon-base ri ri-printer-line me-1"></i>Imprimir</span>`,
                className: classNameItem,
                exportOptions: opts,
                customize: safeCustomize
            },
            {
                extend: 'csv',
                text: `<span class="d-flex align-items-center"><i class="icon-base ri ri-file-text-line me-1"></i>Csv</span>`,
                className: classNameItem,
                exportOptions: opts
            },
            {
                extend: 'excel',
                text: `<span class="d-flex align-items-center"><i class="icon-base ri ri-file-excel-line me-1"></i>Excel</span>`,
                className: classNameItem,
                exportOptions: opts
            },
            {
                extend: 'pdf',
                text: `<span class="d-flex align-items-center"><i class="icon-base ri ri-file-pdf-line me-1"></i>Pdf</span>`,
                className: classNameItem,
                exportOptions: opts
            },
            {
                extend: 'copy',
                text: `<i class="icon-base ri ri-file-copy-line me-1"></i>Copiar`,
                className: classNameItem,
                exportOptions: opts
            }
        ];
    };
}

// Clonado sencillo para no mutar referencias externas
function deepClone(obj) {
    if (obj == null) return obj;
    return JSON.parse(JSON.stringify(obj));
}

// Normalizador: acepta string (p.ej. 'paging') o objeto { rowClass?, features?[] }
function normalizeRegion(regionConfig) {
    // Permitir funciones/fábricas: si es función, ejecutarla para obtener el objeto/valor final
    if (typeof regionConfig === 'function') {
        return normalizeRegion(regionConfig());
    }
    // 'paging' u otros alias string válidos para DataTables layout
    if (typeof regionConfig === 'string') {
        return regionConfig;
    }
    // Objeto: clonar y asegurar estructura
    if (regionConfig && typeof regionConfig === 'object') {
        const out = deepClone(regionConfig);
        if (out.features && !Array.isArray(out.features)) {
            out.features = [out.features];
        }
        return out;
    }
    // No definido: omitir región
    return undefined;
}

/**
 * Construye el layout completo recibiendo las 4 regiones.
 * Cada región puede ser:
 *  - String (ej: 'paging')
 *  - Objeto { rowClass?, features: [] }
 *  - Función que devuelve cualquiera de los dos anteriores
 *
 * @param {*} topStart
 * @param {*} topEnd
 * @param {*} bottomStart
 * @param {*} bottomEnd
 * @returns {Object} layout para DataTables
 */
window.construirDataTableLayout = function (
    topStart,
    topEnd,
    bottomStart,
    bottomEnd
) {
    const layout = {};
    const nsTopStart = normalizeRegion(topStart);
    const nsTopEnd = normalizeRegion(topEnd);
    const nsBottomStart = normalizeRegion(bottomStart);
    const nsBottomEnd = normalizeRegion(bottomEnd);

    if (nsTopStart !== undefined) layout.topStart = nsTopStart;
    if (nsTopEnd !== undefined) layout.topEnd = nsTopEnd;
    if (nsBottomStart !== undefined) layout.bottomStart = nsBottomStart;
    if (nsBottomEnd !== undefined) layout.bottomEnd = nsBottomEnd;

    return layout;
};

// Crea el feature de "tamaño de página"
window.featurePageLength = function (menu = [10, 25, 50, 100], text = 'Mostrar _MENU_') {
  return { pageLength: { menu, text } };
};

// Crea el feature de "botones" (acepta array de botones DataTables Buttons)
window.featureButtons = function (buttons = []) {
  return { buttons: Array.isArray(buttons) ? buttons : (buttons ? [buttons] : []) };
};

// Construye el array de features para topStart,
// combinando (opcionalmente) pageLength + botones
//  - mostrarPageLength: boolean para incluir/omitir el selector de tamaño
//  - botonesTopStart: array de botones (tu colección de export, acciones, etc.)
window.columnTopStart = function (mostrarPageLength = true, botonesTopStart = []) {
  const features = [];
  if (mostrarPageLength) features.push(window.featurePageLength());
  if (botonesTopStart && botonesTopStart.length) {
    features.push(window.featureButtons(botonesTopStart));
  }
  return features;
};

// Envoltura de región topStart: { rowClass, features:[...] }
window.generarTopStart = function (rowClass = 'row mx-2', features = []) {
  return { rowClass, features: Array.isArray(features) ? features : [features] };
};

  function toArray(value) {
    if (Array.isArray(value)) return value;
    if (value == null) return [];
    return [value];
  }

  window.featurePageLength = function (menu = [10, 25, 50, 100], text = 'Mostrar _MENU_') {
    return { pageLength: { menu, text } };
  };

  window.featureButtons = function (buttons = []) {
    return { buttons: toArray(buttons) };
  };

  window.columnTopStart = function (mostrarPageLength = true, botones = []) {
    const features = [];
    if (mostrarPageLength) features.push(window.featurePageLength());
    if (botones?.length) features.push(window.featureButtons(botones));
    return features;
  };

  window.generarTopStart = function (rowClass = 'row mx-2', features = []) {
    return { rowClass, features: toArray(features) };
  };

  window.featureSearch = function (placeholder = 'Buscar', text = '_INPUT_') {
    return { search: { placeholder, text } };
  };

  /**
   * Construye el array de features para el topEnd.
   * @param {boolean} incluirBuscador - Si incluye el campo de búsqueda
   * @param {string} placeholder - Placeholder del buscador
   * @param {string} text - Texto de reemplazo (usualmente "_INPUT_")
   * @param {array} extras - Features adicionales, ej. userRole
   */
  window.columnTopEnd = function (incluirBuscador = true, placeholder = 'Buscar', text = '_INPUT_', extras = []) {
    const features = [];
    if (incluirBuscador) features.push(window.featureSearch(placeholder, text));
    if (extras?.length) features.push(...extras);
    return features;
  };

  /**
   * Crea la sección topEnd del layout.
   */
  window.generarTopEnd = function (features = []) {
    return { features: toArray(features) };
  };

  window.featureInfo = function (text = 'Mostrando del _START_ al _END_ de _TOTAL_ registros') {
    return { info: { text } };
  };

  /**
   * Crea la lista de features para bottomStart.
   * @param {boolean} mostrarInfo - Si incluye el texto de info
   * @param {string} textoInfo - Texto a mostrar en la info
   * @param {array} extras - Features adicionales opcionales
   */
  window.columnBottomStart = function (mostrarInfo = true, textoInfo, extras = []) {
    const features = [];
    if (mostrarInfo) features.push(window.featureInfo(textoInfo));
    if (extras?.length) features.push(...extras);
    return features;
  };

  window.generarBottomStart = function (rowClass = 'row mx-3 justify-content-between', features = []) {
    return { rowClass, features: toArray(features) };
  };

  /**
   * Puede ser string ('paging') o un array de features
   */
  window.generarBottomEnd = function (valor = 'paging') {
    if (typeof valor === 'string') return valor;
    return { features: toArray(valor) };
  };


// Helper súper simple para usar en: responsive: modalDelaTabla('campo')
// Si pasas una función, se usa para armar el título: modalDelaTabla(d => d.name + ' (#' + d.id + ')')
window.modalDetallesFilaTabla = function (txt_titulo = 'name') {
  const buildHeader = (row) => {
    const d = (row && typeof row.data === 'function') ? row.data() : {};
    const titulo = (typeof txt_titulo === 'function')
      ? txt_titulo(d, row)
      : (d?.[txt_titulo] ?? 'Detalle');
    return `Detalles de ${window.escapeHtml(titulo)}`;
  };

  return {
    details: {
      display: DataTable.Responsive.display.modal({ header: buildHeader }),
      type: 'column',
      renderer: function (api, rowIdx, columns) {
        const filas = columns
          .filter(col => col.title !== '' && col.title !== 'Acciones')
          .map(col => `
            <tr data-dt-row="${col.rowIndex}" data-dt-column="${col.columnIndex}">
              <td class="pe-3 text-muted">${window.escapeHtml(col.title)}:</td>
              <td>${(col.data)}</td>
            </tr>
          `)
          .join('');

        if (!filas) return false;

        const div = document.createElement('div');
        div.className = 'table-responsive';
        div.innerHTML = `
          <table class="table table-sm mb-0">
            <tbody>${filas}</tbody>
          </table>`;
        return div;
      }
    }
  };
};

console.info('[Renderizadores globales] cargados correctamente');
