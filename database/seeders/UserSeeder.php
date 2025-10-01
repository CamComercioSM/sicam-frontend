<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Limpia caché de permisos/roles
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $guard = 'web';

        // Aseguramos que los roles existan
        $roles = ['Administrador', 'Soporte', 'Invitado'];
        foreach ($roles as $role) {
            Role::firstOrCreate(['name' => $role, 'guard_name' => $guard]);
        }

        // --- SOPORTE ---
        $soporte = User::firstOrCreate(
            ['email' => 'centro.soporte@ccsm.org.co'],
            [
                'name'              => 'Soporte',
                'password'          => Hash::make('password123'),
                'email_verified_at' => now(),
            ]
        );
        $soporte->syncRoles(['Soporte']);

        // --- ADMIN ---
        $admin = User::firstOrCreate(
            ['email' => 'sicam32@ccsm.org.co'],
            [
                'name'              => 'Administrador',
                'password'          => Hash::make('password123'),
                'email_verified_at' => now(),
            ]
        );
        $admin->syncRoles(['Administrador']); // reemplaza los roles actuales



        // --- INVITADO ---
        $guest = User::firstOrCreate(
            ['email' => 'pruebas@ccsm.org.co'],
            [
                'name'              => 'Invitado',
                'password'          => Hash::make('password123'),
                'email_verified_at' => now(),
            ]
        );
        $guest->syncRoles(['Invitado']);

        // Limpia caché otra vez al final
        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
}
