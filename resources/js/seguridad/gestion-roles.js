/**
 * App user list
 */

'use strict';

// Datatable (js)
document.addEventListener('DOMContentLoaded', function (e) {
  const dtUserTable = document.querySelector('.datatables-users');
  var dt_User,
    userView = baseUrl + 'seguridad/usuarios/ver/cuenta/',
    recursoRolesURL = baseUrl + 'roles-gestion',
    recursoUsuariosURL = baseUrl + 'usuarios-gestion';


  // Users List datatable
  if (dtUserTable) {
    const userRole = document.createElement('div');
    userRole.classList.add('user_role');

    // Contexto para los helpers (ajusta según tus variables globales)
    const ctx = {
      baseUrl,            // ej: window.baseUrl
      userView,           // ej: baseUrl + 'app/user/view/account'
      formatDate,         // tu formateador si existe (sino usan formatDateDefault)
      accionesTabla: accionesTablaRoles  // tu función existente para el último col
    };
    const columnasTablaRoles = [
      // columns according to JSON
      { data: 'id' },
      { data: 'id', orderable: false, render: DataTable.render.select() },
      { data: 'id' },
      { data: 'name' },
      { data: 'identificacion' },
      { data: 'email_verified_at' },
      { data: 'userRole' },
      { data: 'estado' },
      { data: 'action' }
    ];

    function accionesTablaRoles(full) {

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


    const definicionColumnasRoles = [
      {
        className: 'control',
        searchable: false,
        orderable: false,
        responsivePriority: 2,
        targets: 0,
        render: renderColumnaControl
      },
      {
        targets: 1,
        orderable: false,
        searchable: false,
        responsivePriority: 4,
        checkboxes: true,
        render: renderColumnaCheckbox,
        checkboxes: {
          selectAllRender: '<input type="checkbox" class="form-check-input">'
        }
      },
      {
        searchable: false,
        orderable: false,
        targets: 2,
        render: renderColumnaId
      },
      {
        targets: 3,
        responsivePriority: 4,
        // Enlazamos contexto para baseUrl/userView
        render: withCtx(renderColumnaUsuario, ctx)
      },
      {
        targets: 4,
        render: renderColumnaIdentificacion
      },
      {
        targets: 5,
        className: 'text-center',
        render: withCtx(renderColumnaEmailVerificado, ctx)
      },
      {
        targets: 6,
        render: renderColumnaUserRole
      },
      {
        targets: 7,
        render: renderColumnaEstado
      },
      {
        targets: -1,
        title: 'Acciones',
        searchable: false,
        orderable: false,
        render: withCtx(renderColumnaAcciones, ctx)
      }
    ];
    const exportColumns = [2, 3, 4, 5, 6, 7];
    const exportItems = buildExportButtons({
      columns: exportColumns,
      classNameItem: 'dropdown-item'
    });
    const botonesTopStart = [
      {
        extend: 'collection',
        className: 'btn btn-outline-secondary dropdown-toggle',
        text: '<span class="d-flex align-items-center gap-1"><i class="icon-base ri ri-download-line icon-16px me-1"></i> <span class="d-none d-sm-inline-block">Exportar</span></span>',
        buttons: exportItems
      },
      {
        text: '<span class="d-flex align-items-center gap-1"><i class="icon-base ri ri-user-settings-line icon-16px me-1"></i><span class="d-none d-sm-inline-block">Cambiar rol</span></span>',
        className: 'btn btn-primary',
        action: function () {
          resetModal();
          const ids = getSelectedUserIds();
          if (ids.length === 0) {
            alertaError('Sin selección', 'Selecciona al menos un usuario.');
            return;
          }
          document.getElementById('add-role-userIDs').value = ids;
          cambiarTituloModalRoles('Cambiando roles', `Usuarios seleccionados: ${ids.length}`);
          mostrarSelect();
          abrirModal(true);
        }
      },
      {
        text: '<span class="d-flex align-items-center gap-1"><i class="icon-base ri ri-delete-bin-7-line icon-16px me-1"></i><span class="d-none d-sm-inline-block">Eliminar rol</span></span>',
        className: 'btn btn-outline-danger',
        action: function () {
          const ids = getSelectedUserIds();
          if (ids.length === 0) {
            alertaError('Sin selección', 'Selecciona al menos un usuario.');
            return;
          }
          confirmarAccion(
            '¿Eliminar rol de los usuarios seleccionados?',
            `Se removerá el rol de ${ids.length} usuario(s).`,
            function () { bulkRemoveRoles(ids); }
          );
        }
      }
    ];
    const configTopStart = generarTopStart('row mx-2', columnTopStart(true, botonesTopStart));
    const configTopEnd = generarTopEnd(columnTopEnd(true, 'Buscar Usuarios', '_INPUT_', [userRole]));
    const configBottomStart = generarBottomStart('row mx-3 justify-content-between', columnBottomStart(true, 'Mostrando del _START_ al _END_ de _TOTAL_ registros'));
    const configBottomEnd = generarBottomEnd('paging');
    const layout = construirDataTableLayout(
      configTopStart,
      configTopEnd,
      configBottomStart,
      configBottomEnd
    );
    dt_User = new DataTable(dtUserTable, {
      ajax: recursoUsuariosURL,
      dataSrc: limpiarRespuestaDataTable,
      columns: columnasTablaRoles,
      columnDefs: definicionColumnasRoles,
      select: {
        style: 'multi',
        selector: 'td:nth-child(2)'
      },
      order: [[6, 'desc']],
      layout: layout,
      responsive: modalDetallesFilaTabla('name'),
      initComplete: renderAlInicializarTablaRoles
    });

















  }


  // Filter form control to default size
  // ? setTimeout used for multilingual table initialization
  setTimeout(() => {
    const elementsToModify = [
      { selector: '.dt-length', classToAdd: 'my-md-5 my-0 me-2' },
      { selector: '.dt-buttons', classToAdd: 'd-block w-auto', classToRemove: 'flex-wrap' },
      { selector: '.user_role', classToAdd: 'w-px-200' },
      { selector: '.dt-search', classToRemove: 'mt-5', classToAdd: 'mb-sm-5 mb-0' },
      {
        selector: '.dt-layout-start',
        classToAdd: 'mt-5 mt-md-0 px-lg-5 pe-0 ps-2 d-flex justify-content-center',
        classToRemove: 'justify-content-between'
      },
      {
        selector: '.dt-layout-end',
        classToRemove: 'justify-content-between',
        classToAdd:
          'justify-content-md-between justify-content-center d-flex flex-wrap gap-sm-4 gap-5 ps-lg-3 ps-0 mt-0 mb-sm-0 mb-5'
      },
      { selector: '.dt-layout-table', classToRemove: 'row mt-2' },
      { selector: '.dt-layout-full', classToRemove: 'col-md col-12', classToAdd: 'table-responsive' }
    ];
    // Delete record
    elementsToModify.forEach(({ selector, classToRemove, classToAdd }) => {
      document.querySelectorAll(selector).forEach(element => {
        if (classToRemove) {
          classToRemove.split(' ').forEach(className => element.classList.remove(className));
        }
        if (classToAdd) {
          classToAdd.split(' ').forEach(className => element.classList.add(className));
        }
      });
    });
  }, 100);

  // On edit role click, update text
  const modalRolesHTML = document.getElementById('addRoleModal');
  const modalRoles = bootstrap.Modal.getOrCreateInstance(modalRolesHTML);

  var roleEditList = document.querySelectorAll('.role-edit-modal'),
    roleAdd = document.querySelector('.add-new-role'),
    roleTitle = document.querySelector('.role-title'),
    roleSubTitle = document.querySelector('.role-subtitle'),
    formGestionRoles = document.getElementById('addRoleForm')
    ;

  agregarEvento('click', roleAdd, abriraModalNuevoRol)


  if (roleEditList) {
    roleEditList.forEach(function (roleEditEl) {
      roleEditEl.onclick = function () {
        roleTitle.innerHTML = 'Edit Role'; // reset text
      };
    });
  }


  function abriraModalNuevoRol() {
    resetearFormularios(formGestionRoles);
    cambiarTituloModalRoles('Nuevo Rol', 'defina los datos del nuevo rol.');
    abrirModalRoles();
  }

  function cambiarTituloModalRoles(titulo, subtitulo) {
    if (roleTitle) roleTitle.innerHTML = titulo;
    if (roleSubTitle) roleSubTitle.innerHTML = subtitulo;
  }
  function renderAlInicializarTablaRoles() {
    // Adding role filter once table initialized
    this.api()
      .columns(6)
      .every(function () {
        const column = this;
        const select = document.createElement('select');
        select.id = 'UserRole';
        select.className = 'form-select text-capitalize form-select-sm';
        select.innerHTML = '<option value=""> Selecciona un rol </option>';

        userRole.appendChild(select);

        select.addEventListener('change', function () {
          const val = select.value;
          column.search(val ? '^' + val + '$' : '', true, false).draw();
        });

        column
          .data()
          .unique()
          .sort()
          .each(function (d) {
            const option = document.createElement('option');
            option.value = d;
            option.className = 'text-capitalize';
            option.textContent = d;
            select.appendChild(option);
          });
      });

  }

  function abrirModalRoles(op = true) {
    modalRoles[op ? 'show' : 'hide']();
  }




});
