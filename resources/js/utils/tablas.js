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

window.avatarHtml = function (image) {
  if (!image) return '';
  return `<img src="${image}" alt="Foto de perfil" class="rounded-circle">`;
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
  const { userView } = ctx;
  const name = escapeHtml(full?.name);
  const email = escapeHtml(full?.email);
  const image = avatarHtml(full?.userProfilePhoto);

  return (
    '<div class="d-flex justify-content-start align-items-center user-name">' +
    '<div class="avatar-wrapper">' +
    '<div class="avatar avatar-sm me-4">' + image + '</div>' +
    '</div>' +
    '<div class="d-flex flex-column">' +
    `<a href="${userView}${full?.id}" class="text-heading text-truncate"><span class="fw-medium">${name}</span></a>` +
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
  const iconRole = full?.icon_role; // <- este es el nombre correcto de la columna

  if (!userRole || userRole === 'null') {
    return `<span class='text-truncate d-flex align-items-center text-heading'>-</span>`;
  }

  // Crear el HTML del icono si existe
  const iconHtml = iconRole
    ? `<i class="me-1 icon-base ri ri-${iconRole} "></i>`
    : `<i class="me-1 icon-base ri ri-close-fill"></i>`;

  return `
    <span class="text-truncate d-flex align-items-center text-heading">
      ${iconHtml}${escapeHtml(userRole)}
    </span>
  `;
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
  layout.topEnd = {
    features: [
      {
        search: {
          placeholder: 'Buscar Usuarios',
          text: '_INPUT_'
        }
      },
      topEnd
    ]
  };
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

window.featureFiltroSelect = function (select = '') {
  const espacio_div_select = document.createElement('div');
  espacio_div_select.classList.add('user_role');
  return espacio_div_select;
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
  if (extras?.length) features.push(window.featureFiltroSelect("loasfdfasdfasdfsa"));
  return features;
};

/**
 * Crea la sección topEnd del layout.
 */
window.generarTopEnd = function (features = []) {
  return { features: (features) };
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

/**
 * Reinicia completamente un modal Bootstrap:
 * - Limpia formularios internos
 * - Quita clases de validación
 * - Limpia textos y errores
 * 
 * @param {string|HTMLElement} modal - ID o elemento del modal
 */
window.reiniciarModal = function (modal) {
  // Si se pasa un selector o id, obtener el elemento
  if (typeof modal === 'string') {
    modal = document.getElementById(modal) || document.querySelector(modal);
  }
  if (!modal) return;

  // 🔹 Resetear todos los formularios dentro del modal
  modal.querySelectorAll('form').forEach(form => {
    form.reset();
    form.classList.remove('was-validated');
  });

  // 🔹 Quitar clases de error, validaciones visuales, etc.
  modal.querySelectorAll('.is-invalid, .is-valid, .invalid-feedback, .valid-feedback')
    .forEach(el => el.classList.remove('is-invalid', 'is-valid', 'show'));

  // 🔹 Limpiar mensajes o spans de error
  modal.querySelectorAll('.error, .text-danger, .invalid-feedback')
    .forEach(el => el.textContent = '');

  // 🔹 Si hay algún input oculto tipo id o modo, poner en blanco
  modal.querySelectorAll('input[type="hidden"]').forEach(el => el.value = '');

  // 🔹 Si el modal tiene título dinámico, restaurarlo (ajusta según tus textos)
  const titulo = modal.querySelector('.role-title, .modal-title');
  if (titulo) titulo.textContent = 'Agregar Nuevo Rol';

  // 🔹 Si hay un botón principal, reestablecer su texto
  const boton = modal.querySelector('button[type="submit"], .btn-primary');
  if (boton) boton.textContent = 'Guardar';

  // 🔹 Siempre desbloquear el modal (modo editable)
  modal.querySelectorAll('input, select, textarea, button').forEach(el => el.disabled = false);

  if (modal.contains(document.activeElement)) {
    document.activeElement.blur();
  }
};

window.desactivarUsuario = function (user_id) {
  fetch(`${baseUrl}usuarios-gestion/${user_id}`, {
    method: 'PATCH', // o PUT, ambos funcionan
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
    },
    body: JSON.stringify({
      estado: 'desactivo' // o 'activo', 'borrado'
    })
  }).then(response => response.json()) 
  .then(data => {
    if (data) {
    alertaExito('Operacion Completada', data.message );
    } else {
      throw new Error('Deactivacion Fallida');
    }
  })
    .catch(error => {
      console.log(error);
    });
}

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
          .filter(col => col.title !== '')
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

        // Agregamos el cierre automático del modal responsive
        // Espera un tick para que DataTables inserte el modal en el DOM
        setTimeout(() => {
          const modalResponsive = document.querySelector('.dtr-bs-modal');
          if (modalResponsive) {
            // Escuchamos clicks dentro del modal
            modalResponsive.addEventListener('click', (e) => {
              // Si el clic viene de un botón de acción, lo cerramos
              if (e.target.closest('[data-action], .delete-record, .view-record, .suspend-status-user, .edit-role-user ')) {
                const btnClose = modalResponsive.querySelector('.btn-close');
                btnClose?.click(); // dispara el cierre del modal
              }
            });
          }
        }, 100);
        return div;
      }
    }
  };
};

/**
 * Helper global para obtener los IDs seleccionados de una DataTable.
 */
window.getSelectedRowIds = function (dataTable, tableSelector = '.datatables-users', checkboxColumnIndex = 1) {
  const seleccionados = [];

  try {
    // Si usa la extensión "Select"
    const data = dataTable.rows({ selected: true }).data();
    return data.map(d => ({
      id: d.id,
      name: d.name ?? null
    })).toArray();

  } catch (error) {
    // Fallback: detección manual por checkboxes
    const filas = document.querySelectorAll(`${tableSelector} tbody tr`);
    filas.forEach(tr => {
      const chk = tr.querySelector(`td:nth-child(${checkboxColumnIndex + 1}) input[type="checkbox"]`);
      if (chk && chk.checked) {
        const rowData = dataTable.row(tr).data();
        const nameEl = tr.querySelector('.fw-medium');
        const name = rowData?.name ?? (nameEl ? nameEl.textContent.trim() : null);

        if (rowData?.id != null) {
          seleccionados.push({ id: rowData.id, name: name });
        }
      }
    });

    return seleccionados;
  }
};

// Helper global para manejar selecciones en múltiples DataTables
window.SeleccionesDT = (function () {
  const tablas = new Map();
  // key -> { dt, seleccionados: Map, keyField, labelField }

  function init(key, dtInstance, options = {}) {
    const keyField = options.keyField || 'id';
    const labelField = options.labelField || null;

    if (!dtInstance || typeof dtInstance.on !== 'function') {
      console.error('[SeleccionesDT] dtInstance no es un DataTable válido');
      return;
    }

    if (tablas.has(key)) {
      console.warn(`[SeleccionesDT] La clave "${key}" ya está inicializada. Se reutiliza el estado existente.`);
      return;
    }

    const state = {
      dt: dtInstance,
      seleccionados: new Map(),
      keyField,
      labelField
    };

    tablas.set(key, state);

    // Cuando se seleccionan filas
    dtInstance.on('select', function (e, dt, type, indexes) {
      const data = dt.rows(indexes).data().toArray();
      data.forEach(row => {
        const id = row[keyField];
        if (id == null) return;
        const label = labelField ? row[labelField] : null;
        state.seleccionados.set(id, label);
      });
    });

    // Cuando se deseleccionan filas
    dtInstance.on('deselect', function (e, dt, type, indexes) {
      const data = dt.rows(indexes).data().toArray();
      data.forEach(row => {
        const id = row[keyField];
        if (id == null) return;
        state.seleccionados.delete(id);
      });
    });

    // Al redibujar (cambio de página, filtro, etc.) re-aplica selección
    dtInstance.on('draw', function () {
      dtInstance.rows().every(function () {
        const rowData = this.data();
        const id = rowData[keyField];
        if (id == null) return;

        if (state.seleccionados.has(id) && !this.selected()) {
          this.select();
        }
      });
    });
  }

  // Devuelve [{ id, label }, ...]
  function getSeleccionados(key) {
    const state = tablas.get(key);
    if (!state) return [];
    return Array.from(state.seleccionados.entries()).map(([id, label]) => ({
      id,
      label
    }));
  }

  // Solo IDs [id1, id2, ...]
  function getIds(key) {
    const state = tablas.get(key);
    if (!state) return [];
    return Array.from(state.seleccionados.keys());
  }

  // ¿Está seleccionado un ID?
  function isSelected(key, id) {
    const state = tablas.get(key);
    if (!state) return false;
    return state.seleccionados.has(id);
  }

  // Quitar uno o todos
  function eliminar(key, id = null) {
    const state = tablas.get(key);
    if (!state) return;

    const { dt, seleccionados, keyField } = state;

    // Limpiar todos
    if (id === null) {
      seleccionados.clear();
      dt.rows({ selected: true }).deselect();
      return;
    }

    // Quitar uno
    if (!seleccionados.has(id)) return;

    seleccionados.delete(id);

    const filas = dt.rows().indexes().filter(idx => {
      const data = dt.row(idx).data();
      return data && data[keyField] === id;
    });

    if (filas.length > 0) {
      dt.rows(filas).deselect();
    }
  }

  // Limpiar completamente el registro de una tabla
  function reset(key) {
    const state = tablas.get(key);
    if (!state) return;
    state.seleccionados.clear();
    state.dt.rows({ selected: true }).deselect();
  }

  return {
    init,
    getSeleccionados,
    getIds,
    isSelected,
    eliminar,
    reset
  };
})();


console.info('[Renderizadores globales] cargados correctamente');
