<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $guard = 'web';

        $permisos = [
            // Usuarios
            'usuario.ver', 'usuario.crear', 'usuario.editar', 'usuario.eliminar',
            // Roles
            'rol.ver', 'rol.crear', 'rol.editar', 'rol.eliminar', 'rol.asignar',
            // Permisos
            'permiso.ver', 'permiso.sincronizar',
            // Autenticación
            'perfil.ver', 'perfil.editar',
            'contraseña.restablecer',
            'correo.reenviar-verificacion',
            '2fa.activar', '2fa.desactivar',
        ];

        foreach ($permisos as $permiso) {
            Permission::firstOrCreate(['name' => $permiso, 'guard_name' => $guard]);
        }

        // Roles
        $admin   = Role::firstOrCreate(['name' => 'Administrador', 'guard_name' => $guard]);
        $soporte = Role::firstOrCreate(['name' => 'Soporte', 'guard_name' => $guard]);
        $invitado= Role::firstOrCreate(['name' => 'Invitado', 'guard_name' => $guard]);

        // Soporte: todo
        $soporte->syncPermissions(Permission::all());

        // Admin:permisos básicos de gestión
        $admin->syncPermissions([
            'usuario.ver', 'usuario.crear', 'usuario.editar',
            'rol.ver', 'permiso.ver',
            'perfil.ver', 'perfil.editar',
            'contraseña.restablecer',
            'correo.reenviar-verificacion',
            '2fa.activar', '2fa.desactivar',
        ]);

        // Invitado: solo perfil
        $invitado->syncPermissions([
            'perfil.ver', 'perfil.editar',
        ]);

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
}
