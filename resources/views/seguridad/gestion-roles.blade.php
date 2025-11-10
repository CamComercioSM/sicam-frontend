@php
    $configData = Helper::appClasses();
@endphp

@extends('layouts/layoutMaster')

@section('title', 'Roles - Apps')

@section('vendor-style')
    @vite(['resources/assets/vendor/libs/datatables-bs5/datatables.bootstrap5.scss', 'resources/assets/vendor/libs/datatables-responsive-bs5/responsive.bootstrap5.scss', 'resources/assets/vendor/libs/@form-validation/form-validation.scss'])
@endsection

@section('vendor-script')
    @vite(['resources/assets/vendor/libs/datatables-bs5/datatables-bootstrap5.js', 'resources/assets/vendor/libs/@form-validation/popular.js', 'resources/assets/vendor/libs/@form-validation/bootstrap5.js', 'resources/assets/vendor/libs/@form-validation/auto-focus.js'])
@endsection

@section('page-script')
    @vite(['resources/js/seguridad/gestion-roles.js', 'resources/js/seguridad/modal-roles.js'])
@endsection

@section('content')
    <h4 class="mb-1">Lista de roles</h4>
    <p class="mb-6">Un rol proporciona acceso a menús y funciones predefinidas, de modo que, según el rol asignado, un
        administrador puede tener acceso a lo que el usuario necesita.</p>
    <!-- Role cards -->
    <div class="row g-6">
        @foreach ($roles as $role)
            <div class="col-xl-4 col-lg-6 col-md-6">
                <div class="card">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center mb-4">
                            <p class="mb-0">Total {{ $role->users->count() }} usurios</p>
                            <ul class="list-unstyled d-flex align-items-center avatar-group mb-0">
                                @foreach ($role->users->take(3) as $user)
                                    @php
                                        $avatar = $user->profile_photo_path;
                                    @endphp
                                    <li data-bs-toggle="tooltip" data-popup="tooltip-custom" data-bs-placement="top"
                                        title="{{ $user->name }}" class="avatar pull-up">
                                        <img class="rounded-circle" src="{{ asset('storage/' . $avatar) }}" alt="{{ $user->name }}"
                                            style="width: 36px; height: 36px; object-fit: cover;">
                                    </li>
                                @endforeach
                            </ul>
                        </div>
                        <div class="d-flex justify-content-between align-items-center">
                            <div class="role-heading ">
                                <h5 class="mb-1">{{ $role->name }}</h5>
                                <a href="javascript:;" data-name="{{ $role->name }}"
                                    data-id="{{ $role->id }}" class="role-edit-modal">
                                    <p class="mb-0">Editar Rol</p>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        @endforeach
        <div class="col-xl-4 col-lg-6 col-md-6">
            <div class="card h-100">
                <div class="row h-100">
                    <div class="col-5">
                        <div class="d-flex align-items-end h-100 justify-content-center">
                            <img src="{{ asset('assets/img/illustrations/illustration-3.png') }}" class="img-fluid"
                                alt="Image" width="80" />
                        </div>
                    </div>
                    <div class="col-7">
                        <div class="card-body text-sm-end text-center ps-sm-0">
                            <button 
                                class="btn btn-sm btn-primary mb-4 text-nowrap add-new-role">Agregar Nuevo Rol</button>
                            <p class="mb-0">Agregar rol, si no existe.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-12">
            <h4 class="mt-6 mb-1">Total de usuarios con sus roles.</h4>
            <p class="mb-0">Encuentra todas las cuentas de administrador de tu empresa y sus roles asociados.</p>
        </div>
        <div class="col-12">
            <!-- Role Table -->
            <div class="card">
                <div class="card-datatable table-responsive datatable-roles">
                    <table class="datatables-users table">
                        <thead>
                            <tr>
                                <th></th>
                                <th></th>
                                <th>Id</th>
                                <th>Usuario</th>
                                <th>Identificacion</th>
                                <th>Verificacion</th>
                                <th>Rol</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                    </table>
                </div>
            </div>
            <!--/ Role Table -->
        </div>
    </div>
    <!--/ Role cards -->

    <!-- Modal -->
    @include('seguridad/modal-roles')
    <!-- / Add Role Modal '-->
@endsection
