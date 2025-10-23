<?php

namespace App\Http\Controllers\usuarios;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Contracts\View\View;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Collection;


class GestionRoles extends Controller
{

    function GestionRoles(): View
    {
        $roles = Role::all();
        $permisos = Permission::all();
        // Construir colección agrupada: grupo => [operaciones...]
        $coleccionPermisos = $permisos
            ->filter(fn($p) => str_contains($p->name, '.'))
            ->mapToGroups(function ($p) {
                [$grupo, $op] = explode('.', $p->name, 2);
                return [$grupo => $op];
            })
            ->map(fn($ops) => collect($ops)->unique()->values()->all()); // <- cast aquí

        return View('seguridad.gestion-roles', [
            'roles' => $roles,
            'permisos' => $coleccionPermisos,
        ]);
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        if (is_numeric($id)) {
            $user = User::findOrFail($id);
            $roleName = $user->getRoleNames()->first();
        } else {
            $user = null;
            $roleName = $id;
        }
        if ($roleName) {
            $role = Role::where('name', $roleName)->first();

            if ($role) {
                $permissions = $role->permissions;
                $coleccionPermisos = $permissions
                    ->filter(fn($p) => str_contains($p->name, '.'))
                    ->mapToGroups(function ($p) {
                        [$grupo, $op] = explode('.', $p->name, 2);
                        return [$grupo => $op];
                    })
                    ->map(fn($ops) => collect($ops)->unique()->values()->all());

                $rol = [
                    'id' => $role->id,
                    'nombre' => $role->name,
                    'permisos' => $coleccionPermisos,
                ];
            } else {
                $rol = [
                    'nombre' => 'Sin Rol',
                    'permisos' => collect(),
                ];
            }
        } else {
            $rol = [
                'nombre' => 'Sin Rol',
                'permisos' => collect(),
            ];
        }

        return response()->json([
            'user' => $user,
            'rol' => $rol,
        ]);
    }



    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $user = User::findOrFail($id);
        $roleName = $user->getRoleNames()->first();
        if($roleName){$user->removeRole($roleName);}
        return response()->json('Rol removido');
    }
}
