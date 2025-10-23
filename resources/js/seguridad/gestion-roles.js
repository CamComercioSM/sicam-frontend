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
      accionesTablas  // tu función existente para el último col
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
    const exportCols = [2, 3, 4, 5, 6, 7];
    const layout = buildDataTableLayout(exportCols);
    
    dt_User = new DataTable(dtUserTable, {
      processing: true,
      serverSide: true,
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


  function abrirModalRoles(op = true) {
    modalRoles[op ? 'show' : 'hide']();
  }




});
