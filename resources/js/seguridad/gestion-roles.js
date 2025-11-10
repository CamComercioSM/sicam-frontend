/**
 * App user list
 */

'use strict';

// Datatable (js)
document.addEventListener('DOMContentLoaded', function (e) {
  const dtUserTable = document.querySelector('.datatables-users');

  var dt_User,
    userView = baseUrl + 'seguridad/usuarios/ver/cuenta',
    recursoRolesURL = baseUrl + 'roles-gestion',
    recursoUsuariosURL = baseUrl + 'usuarios-gestion';

  // Users List datatable
  if (dtUserTable) {
    // Contexto para los helpers (ajusta según tus variables globales)
    const ctx = {
      baseUrl,            // ej: window.baseUrl
      userView,           // ej: baseUrl + 'seguridad/usuarios/ver/cuenta/'
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
          <a href="javascript:;" data-id="${full['id']}" data-name="${full['name']}" data-role="${full['userRole']}" class="btn btn-sm btn-icon btn-text-secondary rounded-pill waves-effect delete-record"><i class="icon-base ri ri-delete-bin-7-line icon-22px"></i></a>
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
            <a href="javascript:;" data-id="${full['id']}" data-estado="${full['estado']}" class="dropdown-item suspend-status-user">Suspender</a>
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
        //Enlazamos contexto para baseUrl/userView
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
          const ids = getSelectedRowIds(dt_User);
          if (!ids || ids.length === 0) {
            alertaError('Sin selección para cambio de rol', 'Selecciona al menos un usuario.');
            return;
          }
          const soloIds = ids.map(u => u.id);
          document.getElementById('add-role-userIDs').value = JSON.stringify(soloIds);
          cambiarTituloModalRoles('Cambiando roles', `Usuarios seleccionados: ${ids.length}`);
          mostrarSoloSelect();
          abrirModalRoles();
        }
      },
      {
        text: '<span class="d-flex align-items-center gap-1"><i class="icon-base ri ri-delete-bin-7-line icon-16px me-1"></i><span class="d-none d-sm-inline-block">Eliminar rol</span></span>',
        className: 'btn btn-outline-danger',
        action: function () {
          const ids = getSelectedRowIds(dt_User);
          const soloIds = JSON.stringify(ids.map(u => u.id));
          if (ids.length === 0) {
            alertaError('Sin selección para eliminar rol', 'Selecciona al menos un usuario.');
            return;
          }
          confirmarAccion(
            '¿Eliminar rol de los usuarios seleccionados?',
            `Se removerá el rol de ${ids.length} usuario(s).`,
            function () { quitarRolDeVariosUsuarios(soloIds); }
          );
        }
      }
    ];
    const configTopStart = generarTopStart('row mx-2', columnTopStart(true, botonesTopStart));
    const configTopEnd = generarTopEnd(columnTopEnd(true, 'Buscar Usuarios', '_INPUT_', [document.createElement('div').classList.add('user_role')]));
    const configBottomStart = generarBottomStart('row mx-3 justify-content-between', columnBottomStart(true, 'Mostrando del _START_ al _END_ de _TOTAL_ registros'));
    const configBottomEnd = generarBottomEnd('paging');
    function renderAlInicializarTablaRoles(settings, json) {
      this.api()
        .columns(6)
        .every(function () {
          const column = this;
          const select = document.createElement('select');
          select.id = 'UserRole';
          select.className = 'form-select text-capitalize form-select-sm';
          select.innerHTML = '<option value=""> Selecciona un rol </option>';
          let divFiltroRoles = document.querySelector('.user_role');
          divFiltroRoles.appendChild(select);
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

    //creacion de la tabla
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
      layout: {
        topStart: configTopStart,
        topEnd: configTopEnd,
        bottomStart: configBottomStart,
        bottomEnd: configBottomEnd
      },
      responsive: modalDetallesFilaTabla('name'),
      initComplete: renderAlInicializarTablaRoles
    });
  }

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
    formGestionRoles = document.getElementById('addRoleForm'),
    selectRoles = document.getElementById('add-role-userRole');
  // Eventos agregar o editar un rol
  agregarEvento('click', roleAdd, abriraModalNuevoRol);
  agregarEvento('click', roleEditList, abrirModalEditarRol);

  // Eventos de acciones de usuario
  // Evento eliminar Rol del usuario
  agregarEvento('click', document, eliminarRolDelUusuario);
  // Evento mostrar datos de Rol para un usuario
  agregarEvento('click', document, mostrarPermisosYrolUsuario);
  // Evento editar Rol del usuario 
  agregarEvento('click', document, mostrarEditarRolDeUsuario);
  agregarEvento('change', selectRoles, cambiarRoleUsuarioParaEditar);
  // Evento suspender Usuario
  agregarEvento('click', document, suspenderUsuario);

  // Eventos de operaciones masivas
  //agregarEvento('click');
  // Evento al cerrar el modal
  agregarEvento('hidden.bs.modal', addRoleModal, () => reiniciarModal(addRoleModal));

  function abriraModalNuevoRol(evento) {
    const btnNuevoRol = evento.target.closest('.add-new-role');
    if (!btnNuevoRol) return;
    resetearFormularios(formGestionRoles);
    cambiarTituloModalRoles('Nuevo Rol', 'Defina los datos del nuevo rol.');
    mostrarSoloInput();
    abrirModalRoles();
  }

  function abrirModalEditarRol(evento) {
    const btnEditarRol = evento.target.closest('.role-edit-modal');
    if (!btnEditarRol) return;
    const roleName = btnEditarRol.dataset.name;
    const roleId = btnEditarRol.dataset.id;
    resetearFormularios(formGestionRoles);
    cambiarTituloModalRoles('Editando rol', `Permisos del rol: ${roleName}`);
    cargando(true, { text: 'Buscando datos...' });
    mostrarInformacionDeUnRol(roleId);
  }

  function mostrarInformacionDeUnRol(roleId) {
    ejecutarPeticion(`roles-gestion/${roleId}/edit`, 'GET', null, (data) => {
      if (window.overlayCancelado) {
        return;
      }
      mostrarSoloInput();
      document.getElementById('modalRoleName').value = data?.nombre;
      document.getElementById('add-role-roleID').value = data?.id;
      marcarCheckboxesEnModal(data, '#addRoleModal');
      abrirModalRoles();
    }, (error) => {
      abrirModalRoles(false);
      console.log('Error al traer datos para editar', error);
    });
  }

  function crearOeditarRol(searchParams) {
    ejecutarPeticion('roles-gestion', 'POST', searchParams,
      (data) => {
        alertaExito('Operacion exitosa!', 'Es necesario recargar la pagina');
        desbloquearPantalla();
        abrirModalRoles(false);
        setTimeout(() => location.reload(), 1200);
      },
      (error) => {
        console.error('⚠️ Error al crear/editar el rol:', error);
        desbloquearPantalla();
      }
    );
  }

  function eliminarRolDelUusuario(evento) {
    const btnEliminar = evento.target.closest('.delete-record');
    if (!btnEliminar) return;
    confirmarAccion(
      '¿Estás seguro que quieres eliminar el rol del usuario?',
      'Si quieres cambiarlo utiliza la opción editar',
      function () {
        const user_id = btnEliminar.dataset.id;
        const roleName = btnEliminar.dataset.role;
        if (roleName === 'Sin Rol') {
          alertaError('El usuario no tiene rol', 'El usuario que quieres editar no tiene rol');
        } else {
          cargando(true, { text: 'Buscando datos' });
          quitaRoleAlUsuario(user_id);
        }
      }

    );
  }
  function quitaRoleAlUsuario(user_id) {
    ejecutarPeticion(
      `roles-gestion/${user_id}`,
      'DELETE', null,
      () => {
        alertaExito('Rol removido!', 'El usuario está sin rol!');
        dt_User.ajax.reload();
      },
      (error) => {
        alertaError('Error al remover rol', error);
      }
    );
  }
  function quitarRolDeVariosUsuarios(ids) {

    ejecutarPeticion('roles-gestion/operaciones-masivas', 'POST', ids, (data) => {
      alertaExito(`${data.message}`, 'Usuarios sin rol')
      dt_User.ajax.reload();
    }, (error) => {
      console.log('Error al quitar rol a los usuarios');
    });
  };

  function mostrarPermisosYrolUsuario(evento) {
    const btnMostrar = evento.target.closest('.view-record');
    if (!btnMostrar) return;
    const user_name = btnMostrar.dataset.name;
    const user_id = btnMostrar.dataset.id;
    cargando(true, { text: 'Buscando datos' });
    resetearFormularios(formGestionRoles);
    cambiarTituloModalRoles('Rol del usuario', `Rol y permisos del usuario ${user_name}`);
    ejecutarPeticion(`roles-gestion/${user_id}`, 'GET', null, (data) => {
      if (window.overlayCancelado) {
        return;
      }
      mostrarSoloInput();
      document.getElementById('modalRoleName').value = data.role?.nombre;
      marcarCheckboxesEnModal(data.role, '#addRoleModal');
      modalRoles._element.querySelectorAll('input, select, textarea, button:not([data-bs-dismiss])').forEach(el => el.disabled = true);
      abrirModalRoles();
    }, (error) => {
      alertaError('Error al remover rol', error);
    })
  }

  function cambiarRoleUsuarioParaEditar(evento) {
    const selectRole = evento.target.closest('#add-role-userRole');
    if (!selectRole) return;
    if (selectRole.value === "") {
      resetearFormularios(formGestionRoles);
      return;
    }
    const selectedOption = selectRole.options[selectRole.selectedIndex];
    const roleId = selectedOption.dataset.id;
    infoDeRolParaEditar(roleId);
  }

  function infoDeRolParaEditar(roleId) {
    ejecutarPeticion(`roles-gestion/${roleId}/edit`, 'GET', null, (data) => {
      if (window.overlayCancelado) {
        return;
      }
      mostrarSoloSelect();
      document.getElementById('add-role-userRole').value = data?.nombre;
      document.getElementById('modalRoleName').value = data.role?.nombre;
      document.getElementById('add-role-roleID').value = data?.id;
      marcarCheckboxesEnModal(data, '#addRoleModal');
      abrirModalRoles();
    }, (error) => {
      abrirModalRoles(false);
      console.log('Error al traer datos para editar', error);
    });
  }

  function mostrarEditarRolDeUsuario(evento) {
    const btnEditarRol = evento.target.closest('.edit-role-user');
    if (!btnEditarRol) return;

    const user_id = btnEditarRol.dataset.id;
    const user_name = btnEditarRol.dataset.name;
    resetearFormularios(formGestionRoles);
    cambiarTituloModalRoles('Editando rol', `Rol y permisos del usuario: ${user_name}`);
    ejecutarPeticion(`roles-gestion/${user_id}`, 'GET', null, (data) => {
      if (window.overlayCancelado) {
        return;
      }
      mostrarSoloSelect();
      document.getElementById('add-role-userRole').value = data.role?.nombre;
      document.getElementById('modalRoleName').value = data.role?.nombre;
      document.getElementById('add-role-roleID').value = data.role?.id;
      document.getElementById('add-role-userID').value = data.id;
      document.getElementById('add-role-userRoleName').value = data.role?.nombre;

      marcarCheckboxesEnModal(data.role, '#addRoleModal');
      abrirModalRoles();
    }, (error) => {
      abrirModalRoles(false);
      console.log('Error al traer datos para editar', error);
    });
  }

  function editarRolDeUnUsuario(user_id, data) {
    ejecutarPeticion(`roles-gestion/${user_id}`,'PATCH',data, (data)=>{
      dt_User.ajax.reload();
      abrirModalRoles(false);
    },(error)=>{
      console.log(error);
    })
  }

  function cambiarRolVariosUsuarios(searchParams) {
    ejecutarPeticion('roles-gestion/operaciones-masivas', 'POST',searchParams, (data)=>{
      console.log(data);
      alertaExito(`${data.message}`, `Todos son ${data.roleName}`)
      setTimeout(() => dt_User.ajax.reload(), 500);
      abrirModalRoles(false);
    }, (error)=>{ 
      console.log(error);
    })
  }

  function suspenderUsuario(evento) {
    const btnSuspender = evento.target.closest('.suspend-status-user');
    if (!btnSuspender) return;
    confirmarAccion(
      '¿Estás seguro que quieres suspender el usuario?',
      'Podras restaurarlo en Gestion de usuarios',
      function () {
        const user_id = btnSuspender.dataset.id;
        const estado = btnSuspender.dataset.estado;
        if (estado === 'desactivo') {
          alertaError('El usuario esta desactivado', 'El usuario ya esta desactivado');
        } else {
          desactivarUsuario(user_id);
          dt_User.ajax.reload();
          alertaExito('El usuario fue Desactivado', 'Puedes activarlo en Gestion de Usuarios');
        }
      }
    );


  }

  function cambiarTituloModalRoles(titulo, subtitulo) {
    if (roleTitle) roleTitle.innerHTML = titulo;
    if (roleSubTitle) roleSubTitle.innerHTML = subtitulo;
  }

  function abrirModalRoles(op = true) {
    modalRoles[op ? 'show' : 'hide']();
  }

  window.armarDatosFormRoles = function () {
    bloquearPantalla('enviando datos...');

    const form = document.getElementById('addRoleForm');
    const formData = new FormData(form);

    const roleID = formData.get('roleID');
    const userID = formData.get('userID');
    const userRoleName = formData.get('userRoleName');
    const ids = formData.get('userIDs');

    if((roleID || userRoleName === 'Sin rol') && userID){
      editarRolDeUnUsuario(userID, roleID);
    }
    else if (ids){
      cambiarRolVariosUsuarios(formData);
    }else{
      crearOeditarRol(formData);
    }
  };

  function mostrarSoloInput() {
    // Ocultar select y su label
    const select = document.getElementById('add-role-userRole');
    const labelSelect = document.querySelector('label[for="user-role"]');
    if (select) select.style.display = 'none';
    if (labelSelect) labelSelect.style.display = 'none';

    // Mostrar input y su label
    const input = document.getElementById('modalRoleName');
    const labelInput = document.querySelector('label[for="modalRoleName"]');
    if (input) {
      input.value = '';
      input.style.display = 'block';
    }
    if (labelInput) labelInput.style.display = 'block';
  }

  function mostrarSoloSelect() {
    // Ocultar input y su label
    const input = document.getElementById('modalRoleName');
    const labelInput = document.querySelector('label[for="modalRoleName"]');
    if (input) input.style.display = 'none';
    if (labelInput) labelInput.style.display = 'none';

    // Mostrar select y su label
    const select = document.getElementById('add-role-userRole');
    const labelSelect = document.querySelector('label[for="user-role"]');
    if (select) select.style.display = 'block';
    if (labelSelect) labelSelect.style.display = 'block';
  }


});
