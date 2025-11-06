/**
 * Page User management
 */

'use strict';
import { functions } from 'lodash';
import { act } from 'react';
// Datatable (js)
var dt_user_table;

document.addEventListener('DOMContentLoaded', function (e) {
  let borderColor, bodyBg, headingColor;

  borderColor = config.colors.borderColor;
  bodyBg = config.colors.bodyBg;
  headingColor = config.colors.headingColor;

  // Variable declaration for table
  dt_user_table = document.querySelector('.datatables-users');
  const userView = baseUrl + 'seguridad/usuarios/ver/cuenta/',
    offCanvasForm = document.getElementById('offcanvasAddUser');

  // Select2 initialization
  var select2 = $('.select2');
  if (select2.length) {
    var $this = select2;
    select2Focus($this);
    $this.wrap('<div class="position-relative"></div>').select2({
      placeholder: 'Select Country',
      dropdownParent: $this.parent()
    });
  }

  // ajax setup
  $.ajaxSetup({
    headers: {
      'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
    }
  });

  // Users datatable
  if (dt_user_table) {

    const dt_user = new DataTable(dt_user_table, {
      processing: true,
      serverSide: true,
      ajax: {
        url: baseUrl + 'usuarios-gestion',
        dataSrc: function (json) {
          // Ensure recordsTotal and recordsFiltered are numeric and not undefined/null
          if (typeof json.recordsTotal !== 'number') {
            json.recordsTotal = 0;
          }
          if (typeof json.recordsFiltered !== 'number') {
            json.recordsFiltered = 0;
          }

          // Fallback for empty data to avoid pagination NaN issue
          json.data = Array.isArray(json.data) ? json.data : [];

          return json.data;
        }
      },
      columns: [
        // columns according to JSON
        { data: 'id' },
        { data: 'id', orderable: false, render: DataTable.render.select() },
        { data: 'id' },
        { data: 'name' },
        { data: 'identificacion' },
        { data: 'email_verified_at' },
        { data: 'userRole' },
        { data: 'estado' },
        { data: 'updated_at' },
        { data: 'updated_by' },
        { data: 'action' }
      ],
      columnDefs: [
        {
          // For Responsive
          className: 'control',
          searchable: false,
          orderable: false,
          responsivePriority: 2,
          targets: 0,
          render: function (data, type, full, meta) {
            return '';
          }
        },
        {
          // For Checkboxes
          targets: 1,
          orderable: false,
          searchable: false,
          responsivePriority: 4,
          checkboxes: true,
          render: function () {
            return '<input type="checkbox" class="dt-checkboxes form-check-input">';
          },
          checkboxes: {
            selectAllRender: '<input type="checkbox" class="form-check-input">'
          }
        },
        {
          searchable: false,
          orderable: false,
          targets: 2,
          render: function (data, type, full, meta) {
            return `<span>${full.id}</span>`;
          }
        },
        {
          targets: 3,
          responsivePriority: 4,
          render: function (data, type, full, meta) {
            var name = full['name'];
            var email = full['email'];
            var image = full['userProfilePhoto'];
            var avatar;
            if (image) {
              // For Avatar image
              avatar = '<img src="' + baseUrl + image + '" alt="Foto de perfil" class="rounded-circle">';
            }

            // Creates full output for row
            var row_output =
              '<div class="d-flex justify-content-start align-items-center user-name">' +
              '<div class="avatar-wrapper">' +
              '<div class="avatar avatar-sm me-4">' +
              avatar +
              '</div>' +
              '</div>' +
              '<div class="d-flex flex-column">' +
              '<a href="' + userView + '/' + full['id'] + '" class="text-heading text-truncate"><span class="fw-medium">' +
              name +
              '</span></a>' +
              '<small>' +
              email +
              '</small>' +
              '</div>' +
              '</div>';
            return row_output;
          }
        },
        {
          // User email
          targets: 4,
          render: function (data, type, full, meta) {
            const identificacion = full['identificacion'];
            return '<span class="d-flex align-items-center">' +
              '<i class="icon-base ri ri-id-card-line"></i> ' +
              '<span>' + identificacion + '</span>' +
              '</span>';
          }
        },
        {
          // email verify
          targets: 5,
          className: 'text-center',
          render: function (data, type, full, meta) {
            let email_verified_at = full['email_verified_at'];
            let iconHtml;
            if (email_verified_at && email_verified_at !== 'null') {
              // Formato dd/mm/aaaa
              let formattedDate = formatDate(email_verified_at);
              iconHtml = '<i class="icon-base ri ri-mail-check-fill text-success icon-22px text-primary me-2"></i>';
              return (
                '<span class="d-flex align-items-center">' +
                iconHtml +
                '<span>' + formattedDate + '</span>' +
                '</span>'
              );
            } else {
              iconHtml = '<i class="icon-base ri fs-4 ri-shield-line text-danger icon-22px text-primary me-2"></i>';
              return (
                '<span class="d-flex align-items-center">' +
                iconHtml +
                '<span>No verificado</span>' +
                '</span>'
              );
            }
          }
        },
        {
          //User Role
          targets: 6,
          render: function (data, type, full, meta) {
            var userRole = full['userRole'];
            var roleBadgeObj = {
              Asesor: '<i class="icon-base ri ri-user-line icon-22px text-primary me-2"></i>',
              Administrador: '<i class="icon-base ri ri-vip-crown-line icon-22px text-warning me-2"></i>',
              Presidencia: '<i class="icon-base ri ri-pie-chart-line icon-22px text-success me-2"></i>',
              Invitado: '<i class="icon-base ri ri-edit-box-line icon-22px text-info me-2"></i>',
              Soporte: '<i class="icon-base ri ri-computer-line icon-22px text-danger me-2"></i>'
            };
            if (!userRole || userRole === 'null') {
              return "<span class='text-truncate d-flex align-items-center text-heading'>-</span>";
            }
            return (
              "<span class='text-truncate d-flex align-items-center text-heading'>" +
              (roleBadgeObj[userRole] || '') + // Ensures badge exists for the role
              userRole +
              '</span>'
            );
          }
        },
        {
          //User Status
          targets: 7,
          render: function (data, type, full, meta) {
            var estado = full['estado'];
            var roleBadgeObj = {
              activo: '<i class="icon-base ri ri-user-line icon-22px text-primary me-2"></i>',
              desactivo: '<i class="icon-base ri ri-vip-crown-line icon-22px text-warning me-2"></i>',
              borrado: '<i class="icon-base ri ri-pie-chart-line icon-22px text-success me-2"></i>',
            };
            if (!estado || estado === 'null') {
              return "<span class='text-truncate d-flex align-items-center text-heading'>-</span>";
            }
            return (
              "<span class='text-truncate d-flex align-items-center text-heading'>" +
              (roleBadgeObj[estado] || '') + // Ensures badge exists for the role
              estado +
              '</span>'
            );
          }
        },
        {
          // updated_at
          targets: 8,
          className: 'text-center',
          render: function (data, type, full, meta) {
            let updated_at = full['updated_at'];
            if (updated_at && updated_at !== 'null') {
              // Formato dd/mm/aaaa
              let formattedDate = formatDate(updated_at);
              return (
                '<span class="d-flex align-items-center">' +
                '<span>' + formattedDate + '</span>' +
                '</span>'
              );
            } else {
              return (
                '<span class="d-flex align-items-center">' +
                '<span>No verificado</span>' +
                '</span>'
              );
            }
          }
        },
        {
          // updated_at
          targets: 9,
          className: 'text-center',
          render: function (data, type, full, meta) {
            let updated_by = full['updated_by'];
            if (updated_by && updated_by !== 'N/A') {
              // Formato dd/mm/aaaa
              let formattedDate = updated_by;
              return (
                '<span class="d-flex align-items-center">' +
                '<span>' + formattedDate + '</span>' +
                '</span>'
              );
            } else {
              return (
                '<span class="d-flex align-items-center">' +
                '<span>N/A</span>' +
                '</span>'
              );
            }
          }
        },
        {
          // Actions
          targets: -1,
          title: 'Acciones',
          searchable: false,
          orderable: false,
          render: function (data, type, full, meta) {
            return accionesTablaUsuarios(full);
          }
        }
      ],
      order: [[2, 'desc']],
      layout: {
        topStart: {
          rowClass: 'row m-3 my-0 justify-content-between',
          features: [
            {
              pageLength: {
                menu: [7, 10, 20, 50, 70, 100, 200, 500],
                text: '_MENU_'
              }
            }
          ]
        },
        topEnd: {
          features: [
            {
              search: {
                placeholder: 'Escribe la identificacion o el correo para buscar...',
                text: '_INPUT_'
              }
            },
            {
              buttons: [
                {
                  extend: 'collection',
                  className: 'btn btn-label-secondary dropdown-toggle',
                  text: '<i class="icon-base ri ri-upload-2-line me-2 icon-sm"></i>Exportar',
                  buttons: [
                    {
                      extend: 'print',
                      title: 'Users',
                      text: '<i class="icon-base ri ri-printer-line me-2" ></i>Print',
                      className: 'dropdown-item',
                      exportOptions: {
                        columns: [1, 2, 3, 4, 5],
                        // prevent avatar to be print
                        format: {
                          body: function (inner, coldex, rowdex) {
                            if (inner.length <= 0) return inner;

                            // Check if inner is HTML content
                            if (inner.indexOf('<') > -1) {
                              const parser = new DOMParser();
                              const doc = parser.parseFromString(inner, 'text/html');

                              // Get all text content
                              let text = '';

                              // Handle specific elements
                              const userNameElements = doc.querySelectorAll('.user-name');
                              if (userNameElements.length > 0) {
                                userNameElements.forEach(el => {
                                  // Get text from nested structure
                                  const nameText =
                                    el.querySelector('.fw-medium')?.textContent ||
                                    el.querySelector('.d-block')?.textContent ||
                                    el.textContent;
                                  text += nameText.trim() + ' ';
                                });
                              } else {
                                // Get regular text content
                                text = doc.body.textContent || doc.body.innerText;
                              }

                              return text.trim();
                            }

                            return inner;
                          }
                        }
                      },
                      customize: function (win) {
                        win.document.body.style.color = config.colors.headingColor;
                        win.document.body.style.borderColor = config.colors.borderColor;
                        win.document.body.style.backgroundColor = config.colors.bodyBg;
                        const table = win.document.body.querySelector('table');
                        table.classList.add('compact');
                        table.style.color = 'inherit';
                        table.style.borderColor = 'inherit';
                        table.style.backgroundColor = 'inherit';
                      }
                    },
                    {
                      extend: 'csv',
                      title: 'Users',
                      text: '<i class="icon-base ri ri-file-text-line me-2" ></i>Csv',
                      className: 'dropdown-item',
                      exportOptions: {
                        columns: [1, 2, 3, 4, 5],
                        format: {
                          body: function (inner, coldex, rowdex) {
                            if (inner.length <= 0) return inner;

                            // Parse HTML content
                            const parser = new DOMParser();
                            const doc = parser.parseFromString(inner, 'text/html');

                            let text = '';

                            // Handle user-name elements specifically
                            const userNameElements = doc.querySelectorAll('.user-name');
                            if (userNameElements.length > 0) {
                              userNameElements.forEach(el => {
                                // Get text from nested structure - try different selectors
                                const nameText =
                                  el.querySelector('.fw-medium')?.textContent ||
                                  el.querySelector('.d-block')?.textContent ||
                                  el.textContent;
                                text += nameText.trim() + ' ';
                              });
                            } else {
                              // Handle other elements (status, role, etc)
                              text = doc.body.textContent || doc.body.innerText;
                            }

                            return text.trim();
                          }
                        }
                      }
                    },
                    {
                      extend: 'excel',
                      text: '<i class="icon-base ri ri-file-excel-line me-2"></i>Excel',
                      className: 'dropdown-item',
                      exportOptions: {
                        columns: [1, 2, 3, 4, 5],
                        format: {
                          body: function (inner, coldex, rowdex) {
                            if (inner.length <= 0) return inner;

                            // Parse HTML content
                            const parser = new DOMParser();
                            const doc = parser.parseFromString(inner, 'text/html');

                            let text = '';

                            // Handle user-name elements specifically
                            const userNameElements = doc.querySelectorAll('.user-name');
                            if (userNameElements.length > 0) {
                              userNameElements.forEach(el => {
                                // Get text from nested structure - try different selectors
                                const nameText =
                                  el.querySelector('.fw-medium')?.textContent ||
                                  el.querySelector('.d-block')?.textContent ||
                                  el.textContent;
                                text += nameText.trim() + ' ';
                              });
                            } else {
                              // Handle other elements (status, role, etc)
                              text = doc.body.textContent || doc.body.innerText;
                            }

                            return text.trim();
                          }
                        }
                      }
                    },
                    {
                      extend: 'pdf',
                      title: 'Users',
                      text: '<i class="icon-base ri ri-file-pdf-line me-2"></i>Pdf',
                      className: 'dropdown-item',
                      exportOptions: {
                        columns: [1, 2, 3, 4, 5],
                        format: {
                          body: function (inner, coldex, rowdex) {
                            if (inner.length <= 0) return inner;

                            // Parse HTML content
                            const parser = new DOMParser();
                            const doc = parser.parseFromString(inner, 'text/html');

                            let text = '';

                            // Handle user-name elements specifically
                            const userNameElements = doc.querySelectorAll('.user-name');
                            if (userNameElements.length > 0) {
                              userNameElements.forEach(el => {
                                // Get text from nested structure - try different selectors
                                const nameText =
                                  el.querySelector('.fw-medium')?.textContent ||
                                  el.querySelector('.d-block')?.textContent ||
                                  el.textContent;
                                text += nameText.trim() + ' ';
                              });
                            } else {
                              // Handle other elements (status, role, etc)
                              text = doc.body.textContent || doc.body.innerText;
                            }

                            return text.trim();
                          }
                        }
                      }
                    },
                    {
                      extend: 'copy',
                      title: 'Users',
                      text: '<i class="icon-base ri ri-file-copy-line me-2" ></i>Copy',
                      className: 'dropdown-item',
                      exportOptions: {
                        columns: [1, 2, 3, 4, 5],
                        format: {
                          body: function (inner, coldex, rowdex) {
                            if (inner.length <= 0) return inner;

                            // Parse HTML content
                            const parser = new DOMParser();
                            const doc = parser.parseFromString(inner, 'text/html');

                            let text = '';

                            // Handle user-name elements specifically
                            const userNameElements = doc.querySelectorAll('.user-name');
                            if (userNameElements.length > 0) {
                              userNameElements.forEach(el => {
                                // Get text from nested structure - try different selectors
                                const nameText =
                                  el.querySelector('.fw-medium')?.textContent ||
                                  el.querySelector('.d-block')?.textContent ||
                                  el.textContent;
                                text += nameText.trim() + ' ';
                              });
                            } else {
                              // Handle other elements (status, role, etc)
                              text = doc.body.textContent || doc.body.innerText;
                            }

                            return text.trim();
                          }
                        }
                      }
                    }
                  ]
                },
                {
                  text: '<i class="icon-base ri ri-add-line icon-sm me-0 me-sm-2"></i><span class="d-none d-sm-inline-block">Nuevo Usuario</span>',
                  className: 'add-new btn btn-primary',
                  attr: {
                    'data-bs-toggle': 'offcanvas',
                    'data-bs-target': '#offcanvasAddUser'
                  }
                }
              ]
            }
          ]
        },
        bottomStart: {
          rowClass: 'row mx-3 justify-content-between',
          features: [
            {
              info: {
                text: 'Mostrando del _START_ al _END_ de un total de _TOTAL_ registros'
              }
            }
          ]
        },
        bottomEnd: 'paging'
      },
      displayLength: 7,
      language: {
        paginate: {
          next: '<i class="icon-base ri ri-arrow-right-s-line scaleX-n1-rtl icon-22px"></i>',
          previous: '<i class="icon-base ri ri-arrow-left-s-line scaleX-n1-rtl icon-22px"></i>',
          first: '<i class="icon-base ri ri-skip-back-mini-line scaleX-n1-rtl icon-22px"></i>',
          last: '<i class="icon-base ri ri-skip-forward-mini-line scaleX-n1-rtl icon-22px"></i>'
        }
      },
      // For responsive popup
      responsive: {
        details: {
          display: DataTable.Responsive.display.modal({
            header: function (row) {
              const data = row.data();
              return 'Details of ' + data['name'];
            }
          }),
          type: 'column',
          renderer: function (api, rowIdx, columns) {
            const data = columns
              .map(function (col) {
                return col.title !== '' // Do not show row in modal popup if title is blank (for check box)
                  ? `<tr data-dt-row="${col.rowIndex}" data-dt-column="${col.columnIndex}">
                      <td>${col.title}:</td>
                      <td>${col.data}</td>
                    </tr>`
                  : '';
              })
              .join('');

            if (data) {
              const div = document.createElement('div');
              div.classList.add('table-responsive');
              const table = document.createElement('table');
              div.appendChild(table);
              table.classList.add('table');
              const tbody = document.createElement('tbody');
              tbody.innerHTML = data;
              table.appendChild(tbody);
              return div;
            }
            return false;
          }
        }
      },
      initComplete: function () {
        // Remove btn-secondary from export buttons
        document.querySelectorAll('.dt-buttons .btn').forEach(btn => {
          btn.classList.remove('btn-secondary');
        });
        const api = this.api();

        // // Helper function to create a select dropdown and append options
        const createFilter = (columnIndex, containerClass, selectId, defaultOptionText) => {
          const column = api.column(columnIndex);
          const select = document.createElement('select');
          select.id = selectId;
          select.className = 'form-select text-capitalize';
          select.innerHTML = `<option value="">${defaultOptionText}</option>`;
          document.querySelector(containerClass).appendChild(select);

          // Add event listener for filtering
          select.addEventListener('change', () => {
            const val = select.value ? `^${select.value}$` : '';
            column.search(val, true, false).draw();
          });

          // Populate options based on unique column data
          const uniqueData = Array.from(new Set(column.data().toArray())).sort();
          uniqueData.forEach(d => {
            const option = document.createElement('option');
            option.value = d;
            option.textContent = d;
            select.appendChild(option);
          });
        };

        // // Role filter
        createFilter(6, '.user_role', 'UserRole', 'Seleccionar Rol');
        createFilter(7, '.user_estado', 'UserEstado', 'Seleccionar Estado');
      }
    });

    // Delete Record
    document.addEventListener('click', function (e, o) {
      if (e.target.closest('.delete-record')) {
        const deleteBtn = e.target.closest('.delete-record');
        const user_id = deleteBtn.dataset.id;
        confirmarBorrarUsuario(user_id);
      }
    });

    // edit record
    document.addEventListener('click', function (e) {
      if (e.target.closest('.edit-record')) {
        const editBtn = e.target.closest('.edit-record');
        const user_id = editBtn.dataset.id;
        abrirOffCanvasUsuariosParaEditar(user_id);
      }
    });

    // changing the title
    const addNewBtn = document.querySelector('.add-new');
    if (addNewBtn) {
      addNewBtn.addEventListener('click', function () {
        document.getElementById('user_id').value = ''; //resetting input field
        cambiarTituloOffCanvasUsuarios('Creando Nuevo Usuario');
      });
    }

    // Filter form control to default size
    setTimeout(() => {
      const elementsToModify = [
        { selector: '.dt-buttons .btn', classToRemove: 'btn-secondary' },
        { selector: '.dt-length .form-select', classToAdd: 'ms-0' },
        { selector: '.dt-length', classToAdd: 'mb-md-5 mb-0' },
        {
          selector: '.dt-layout-end',
          classToRemove: 'justify-content-between',
          classToAdd: 'd-flex gap-md-4 justify-content-md-between justify-content-center gap-md-2 flex-wrap mt-0'
        },
        { selector: '.dt-layout-start', classToAdd: 'mt-md-0 mt-5' },
        {
          selector: '.dt-layout-start .dt-buttons',
          classToAdd: 'd-md-flex d-block gap-4 justify-content-center'
        },
        {
          selector: '.dt-layout-end .dt-buttons',
          classToAdd: 'd-md-flex d-block gap-4 mb-md-0 mb-5 justify-content-center'
        },
        { selector: '.dt-layout-table', classToRemove: 'row mt-2' },
        { selector: '.dt-layout-full', classToRemove: 'col-md col-12' },
        { selector: '.dt-layout-full .table', classToAdd: 'table-responsive' }
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
  }

  // validating form and updating user's data
  const addNewUserForm = document.getElementById('addNewUserForm');

  // user form validation
  if (addNewUserForm) {
    const fv = FormValidation.formValidation(addNewUserForm, {
      fields: {
        name: {
          validators: {
            notEmpty: {
              message: 'Please enter fullname'
            }
          }
        },
        email: {
          validators: {
            notEmpty: {
              message: 'Please enter your email'
            },
            emailAddress: {
              message: 'The value is not a valid email address'
            }
          }
        },
        personaIDENTIFICACION: {
          validators: {
            notEmpty: {
              message: 'Por favor ingresar la cedula'
            }
          }
        },
        userRole: {
          validators: {
            notEmpty: {
              message: 'Please enter your company'
            }
          }
        }
      },
      plugins: {
        trigger: new FormValidation.plugins.Trigger(),
        bootstrap5: new FormValidation.plugins.Bootstrap5({
          // Use this for enabling/changing valid/invalid class
          eleValidClass: '',
          rowSelector: function (field, ele) {
            // field is the field name & ele is the field element
            return '.form-control-validation';
          }
        }),
        submitButton: new FormValidation.plugins.SubmitButton(),
        autoFocus: new FormValidation.plugins.AutoFocus()
      }
    }).on('core.form.valid', function () {
      enviarDatosUsuario();
    });
    // clearing form data when offcanvas hidden
    offCanvasForm.addEventListener('hidden.bs.offcanvas', function () {
      fv.resetForm(true);
    });
  }


  function cambiarTituloOffCanvasUsuarios(titulo) {
    document.getElementById('offcanvasAddUserLabel').innerHTML = titulo;
  }

  function accionesTablaUsuarios(full) {

    let accionButtons = '<a href="' + userView + '/' + full['id'] + '" class="dropdown-item">Ver Detalles</a>';
    switch (full['estado']) {
      case 'activo':
        // Acciones para usuario activo
        accionButtons += '<a href="javascript:confirmarDesactivarUsuario(' + full['id'] + ');"  class="dropdown-item">Desactivar</a>';
        break;
      case 'desactivo':
        // Acciones para usuario desactivado
        accionButtons += '<a href="javascript:confirmarActivarUsuario(' + full['id'] + ');"  class="dropdown-item">Activar</a>';
        break;
      case 'borrado':
        // Acciones para usuario borrado
        accionButtons += '<a href="javascript:confirmarRestaurarUsuario(' + full['id'] + ');"  class="dropdown-item">Restaurar</a>';
        break;
      default:
        // Acciones por defecto si el estado no coincide con ninguno de los casos anteriores
        break;
    }

    return (
      '<div class="d-flex align-items-center gap-4">' +
      `<button class="btn btn-icon btn-text-secondary btn-sm rounded-pill edit-record" data-id="${full['id']}" data-bs-toggle="offcanvas" data-bs-target="#offcanvasAddUser"><i class="icon-base ri ri-edit-box-line icon-22px"></i></button>` +
      `<button class="btn btn-icon btn-text-secondary btn-sm rounded-pill delete-record" data-id="${full['id']}"><i class="icon-base ri ri-delete-bin-7-line icon-22px"></i></button>` +
      '<button class="btn btn-icon btn-text-secondary btn-sm rounded-pill dropdown-toggle hide-arrow" data-bs-toggle="dropdown"><i class="icon-base ri ri-more-2-line icon-22px"></i></button>' +
      '<div class="dropdown-menu dropdown-menu-end m-0">' + accionButtons + '</div>' +
      '</div>'
    );
  }

  function ocultarOffCanvasUsuarios() {
    const offcanvasInstance = bootstrap.Offcanvas.getInstance(offCanvasForm);
    offcanvasInstance && offcanvasInstance.hide();
  }

  function ocultarModalUsuarios() {
    const dtrModal = document.querySelector('.dtr-bs-modal.show');
    // hide responsive modal in small screen
    if (dtrModal) {
      const bsModal = bootstrap.Modal.getInstance(dtrModal);
      bsModal.hide();
    }
  }

  function abrirOffCanvasUsuariosParaEditar(user_id) {
    cambiarTituloOffCanvasUsuarios('Editando Usuario');
    traerDatosUsuario(user_id);
    ocultarModalUsuarios();
  }
  function traerDatosUsuario(user_id) {
    // get data
    fetch(`${baseUrl}usuarios-gestion/${user_id}/edit`)
      .then(response => response.json())
      .then(data => {
        document.getElementById('user_id').value = data.id;
        document.getElementById('add-user-fullname').value = data.name;
        document.getElementById('add-user-email').value = data.email;
        document.getElementById('add-user-personaIDENTIFICACION').value = data.identificacion;
        document.getElementById('add-user-userRole').value = data.userRole;
      });
  }
  function enviarDatosUsuario() {
    // adding or updating user when form successfully validate
    const formData = new FormData(addNewUserForm);
    const formDataObj = {};

    // Convert FormData to URL-encoded string
    formData.forEach((value, key) => {
      formDataObj[key] = value;
    });

    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(formDataObj)) {
      searchParams.append(key, value);
    }

    guardarUsuario(searchParams);
  }
  function guardarUsuario(searchParams) {
    fetch(`${baseUrl}usuarios-gestion`, {
      method: 'POST',
      headers: {
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: searchParams.toString()
    })
      .then(async response => {
        let data = await response.json();
        if (response.ok) {
          switch (data.TIPO) {
            case 'ERROR':
              alertaError('Error creando el usuario', data.MENSAJE);
              break;
            default:
              alertaExito('Usuario Creado', data.MENSAJE || 'Operación completada.');
              ocultarOffCanvasUsuarios();
          }
          dt_user_table && new DataTable(dt_user_table).draw();
        }
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
      })
      .catch(err => {
        ocultarOffCanvasUsuarios();
        console.log('There has been a problem with your fetch operation: ', err);
      });
  }

  function confirmarBorrarUsuario(user_id) {
    ocultarModalUsuarios();
    confirmarAccion(
      'Estas Seguro que quieres eliminar el usuario?',
      "Si realizas estas accion, puedes ir a la papelera a recuperar el usuario.",
      function () {
        // delete the data
        borrarUsuario(user_id);
      });
  }
  function borrarUsuario(user_id) {
    fetch(`${baseUrl}usuarios-gestion/${user_id}`, {
      method: 'DELETE',
      headers: {
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
        'Content-Type': 'application/json'
      }
    })
      .then(response => {
        if (response.ok) {
          dt_user_table && new DataTable(dt_user_table).draw();
          // success sweetalert
          alertaExito('Deleted!', 'The user has been deleted!');
        } else {
          throw new Error('Delete failed');
        }
      })
      .catch(error => {
        console.log(error);
      });
  }
  window.confirmarDesactivarUsuario = function (user_id) {
    ocultarModalUsuarios();
    confirmarAccion(
      'Estas Seguro que quieres desactivar el usuario?',
      null,
      function () {
        desactivarUsuario(user_id);
        dt_user_table && new DataTable(dt_user_table).draw();
        alertaExito('Usuario Desactivado!', 'El usuario ha sido desactivado!');
      }
    );
  }
  window.confirmarActivarUsuario = function (user_id) {
    ocultarModalUsuarios();
    confirmarAccion(
      'Estas Seguro que quieres activar el usuario?',
      null,
      function () {
        // delete the data
        activarUsuario(user_id);
      });
  }
  window.activarUsuario = function (user_id) {
    fetch(`${baseUrl}usuarios-gestion/${user_id}`, {
      method: 'PATCH', // o PUT, ambos funcionan
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
      },
      body: JSON.stringify({
        estado: 'activo' // o 'activo', 'borrado'
      })
    }).then(response => {
      if (response.ok) {
        dt_user_table && new DataTable(dt_user_table).draw();
        alertaExito('Usuario activado!', 'El usuario ha sido activado!');
      } else {
        throw new Error('Activacion failed');
      }
    })
      .catch(error => {
        console.log(error);
      });
  }
});
