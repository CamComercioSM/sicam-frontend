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
        return response()->json('Created');
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        // Buscar el usuario por ID
        $user = User::findOrFail($id);

        // Obtener el primer rol asignado al usuario
        $role = $user->roles()->first();

        if ($role) {
            $permissions = $role->permissions;

            $coleccionPermisos = $permissions
                ->filter(fn($p) => str_contains($p->name, '.'))
                ->mapToGroups(function ($p) {
                    [$grupo, $op] = explode('.', $p->name, 2);
                    return [$grupo => $op];
                })
                ->map(fn($ops) => collect($ops)->unique()->values()->all());

            // Agregar el rol y sus permisos al objeto usuario
            $user->role = [
                'id'       => $role->id,
                'nombre'   => $role->name,
                'permisos' => $coleccionPermisos,
            ];
        } else {
            $user->role = [
                'nombre'   => 'Sin Rol',
                'permisos' => collect(),
            ];
        }

        // Retornar solo el usuario completo
        return response()->json($user);
    }




    /**
     * Show the form for editing the specified resource.
     */
    public function edit($id)
    {
        // Buscar el rol por ID
        $role = Role::findOrFail($id);

        // Obtener los permisos asociados
        $permissions = $role->permissions;

        // Agrupar los permisos por módulo (antes del punto)
        $coleccionPermisos = $permissions
            ->filter(fn($p) => str_contains($p->name, '.'))
            ->mapToGroups(function ($p) {
                [$grupo, $op] = explode('.', $p->name, 2);
                return [$grupo => $op];
            })
            ->map(fn($ops) => collect($ops)->unique()->values()->all());

        // Estructurar la respuesta del rol
        $rol = [
            'id'       => $role->id,
            'nombre'   => $role->name,
            'permisos' => $coleccionPermisos,
        ];

        // Devolver respuesta JSON
        return response()->json($rol);
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
        if ($roleName) {
            $user->removeRole($roleName);
        }
        return response()->json('Rol removido');
    }
}
