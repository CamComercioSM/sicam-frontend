<?php

namespace App\Http\Controllers\usuarios;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Contracts\View\View;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Collection;


class RoleManagement extends Controller
{

    function RoleManagement(): View
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
            

        return View('content.apps.app-access-roles', [
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
    public function show(string $id)
    {
        //
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
    public function destroy(string $id)
    {
        //
    }
}
