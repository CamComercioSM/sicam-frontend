<!-- Add Role Modal -->
<div class="modal fade" id="addRoleModal" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog modal-lg modal-simple modal-dialog-centered modal-add-new-role">
    <div class="modal-content">
      <div class="modal-body p-0">
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        <div class="text-center mb-6">
          <h4 class="role-title mb-2 pb-0">Agregar Nuevo Rol</h4>
          <p>Establecer permisos para el  rol.</p>
        </div>
        <!-- Add role form -->
        <form id="addRoleForm" class="row g-3" onsubmit="return false">
          <div class="col-12 form-control-validation mb-3">
            <div class="form-floating form-floating-outline">
              <input type="text" id="modalRoleName" name="modalRoleName" class="form-control" placeholder="Ingresa el nombre del rol" tabindex="-1" />
              <label for="modalRoleName">Nombre del rol</label>
                <select id="add-user-userRole" name="userRole" class="form-select">
                  <option id="add-user-userRole-select" value="">Selecciona un rol...</option>
                  @foreach ($roles as $role)
                      <option value="{{ $role->name }}">{{ ucfirst($role->name) }}</option>
                  @endforeach
                </select>
              <label for="user-role">Rol de Usuario</label>
            </div>
          </div>
          <div class="col-12">
            <h5>Role Permissions</h5>
            <!-- Permission table -->
            <div class="table-responsive">
              <table class="table table-flush-spacing">
                <tbody>
                  <tr>
                    <td class="text-nowrap fw-medium">Administrador de acceso <i class="icon-base ri ri-information-line" data-bs-toggle="tooltip" data-bs-placement="top" title="Permite acceso completo al sistema."></i></td>
                    <td>
                      <div class="d-flex justify-content-end">
                        <div class="form-check">
                          <input class="form-check-input" type="checkbox" id="selectAll" />
                          <label class="form-check-label" for="selectAll"> @livewireScriptConfig() Seleccionar todo </label>
                        </div>
                      </div>
                    </td>
                  </tr>
                  @foreach ($permisos as $grupo => $acciones ) 
                  <tr>
                    <td class="text-nowrap fw-medium">{{ $grupo }}</td>
                      <td>
                      {{-- Contenedor flexible y responsive --}}
                      <div class="d-flex flex-wrap justify-content-start gap-2">
                        @foreach ($acciones as $accion)
                          <div class="col-12 col-sm-6 col-md-3 px-1">
                            <div class="form-check">
                              <input
                                class="form-check-input"
                                type="checkbox"
                                id="{{ $grupo }}_{{ $accion }}"
                                name="permisos[{{ $grupo }}][]"
                                value="{{ $accion }}"
                              />
                              <label class="form-check-label" for="{{ $grupo }}_{{ $accion }}">
                                {{ ucfirst($accion) }}
                              </label>
                            </div>
                          </div>
                        @endforeach
                      </div>
                    </td>
                  </tr>
                  @endforeach
                </tbody>
              </table>
            </div>
            <!-- Permission table -->
          </div>
          <div class="col-12 text-center">
            <button type="submit" class="btn btn-primary me-3">Submit</button>
            <button type="reset" class="btn btn-outline-secondary" data-bs-dismiss="modal" aria-label="Close">Cancel</button>
          </div>
        </form>
        <!--/ Add role form -->
      </div>
    </div>
  </div>
</div>
<!--/ Add Role Modal -->