<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Team;
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
        $teamGeneral  = Team::where('name', 'CCSM')->first();
        $teamInvitados = Team::where('name', 'Invitados')->first();

        // Roles (con guard_name consistente)
        $roles = ['Administrador', 'Invitado', 'Soporte'];
        foreach ($roles as $role) {
            Role::firstOrCreate(['name' => $role, 'guard_name' => 'web']);
        }

        // --- ADMIN (team CCSM) ---
        $admin = User::firstOrCreate(
            ['email' => 'sicam32@ccsm.org.co'],
            [
                'name' => 'Administrador',
                'password' => Hash::make('password123'),
                'email_verified_at' => now(),
                'current_team_id' => $teamGeneral->id,
            ]
        );

        // Asociar al team (forma segura de contains)
        if ($teamGeneral && !$admin->teams->contains('id', $teamGeneral->id)) {
            $admin->teams()->attach($teamGeneral->id);
            $admin->refresh();
            $admin->switchTeam($teamGeneral);
        }

        // Asignar rol en contexto de team CCSM
        app(PermissionRegistrar::class)->setPermissionsTeamId($teamGeneral->id);
        $admin->syncRoles(['Administrador']);


        // --- SOPORTE (team CCSM) ---
        $support = User::firstOrCreate(
            ['email' => 'centro.soporte@ccsm.org.co'],
            [
                'name' => 'Soporte',
                'password' => Hash::make('password123'),
                'email_verified_at' => now(),
                'current_team_id' => $teamGeneral->id,
            ]
        );

        if ($teamGeneral && !$support->teams->contains('id', $teamGeneral->id)) {
            $support->teams()->attach($teamGeneral->id);
            $support->refresh();
            $support->switchTeam($teamGeneral);
        }

        app(PermissionRegistrar::class)->setPermissionsTeamId($teamGeneral->id);
        $support->syncRoles(['Soporte']);


        // --- INVITADO (team Invitados) ---
        $guest = User::firstOrCreate(
            ['email' => 'pruebas@ccsm.org.co'],
            [
                'name' => 'Invitado',
                'password' => Hash::make('password123'),
                'email_verified_at' => now(),
                'current_team_id' => $teamInvitados->id,
            ]
        );

        if ($teamInvitados && !$guest->teams->contains('id', $teamInvitados->id)) {
            $guest->teams()->attach($teamInvitados->id);
            $guest->refresh();
            $guest->switchTeam($teamInvitados);
        }

        app(PermissionRegistrar::class)->setPermissionsTeamId($teamInvitados->id);
        $guest->syncRoles(['Invitado']);
    }
}
