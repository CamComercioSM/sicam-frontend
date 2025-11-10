@extends('layouts/layoutMaster')

@section('title', 'Permission - Apps')

@section('vendor-style')
@vite(['resources/assets/vendor/libs/datatables-bs5/datatables.bootstrap5.scss', 'resources/assets/vendor/libs/datatables-responsive-bs5/responsive.bootstrap5.scss', 'resources/assets/vendor/libs/datatables-buttons-bs5/buttons.bootstrap5.scss', 'resources/assets/vendor/libs/@form-validation/form-validation.scss'])
@endsection

@section('vendor-script')
@vite(['resources/assets/vendor/libs/datatables-bs5/datatables-bootstrap5.js', 'resources/assets/vendor/libs/@form-validation/popular.js', 'resources/assets/vendor/libs/@form-validation/bootstrap5.js', 'resources/assets/vendor/libs/@form-validation/auto-focus.js'])
@endsection

@section('page-script')
@vite(['resources/js/seguridad/gestion-permisos.js', 'resources/js/seguridad/modal-permisos.js', 'resources/js/seguridad/modal-editar-permisos.js'])
@endsection

@section('content')
<!-- Permission Table -->
<div class="card">
  <div class="card-datatable">
    <table class="datatables-permissions table">
      <thead>
        <tr>
          <th></th>
          <th></th>
          <th>Nombre</th>
          <th>Asignado a</th>
          <th>Fecha de creacion</th>
          <th>Acciones</th>
        </tr>
      </thead>
    </table>
  </div>
</div>
<!--/ Permission Table -->

<!-- Modal -->
@include('seguridad/modal-permisos')
@include('seguridad/modal-editar-permisos')
<!-- /Modal -->
@endsection