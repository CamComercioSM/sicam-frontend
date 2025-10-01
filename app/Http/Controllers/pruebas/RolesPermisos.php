<?php

namespace App\Http\Controllers\pruebas;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use Illuminate\Support\Facades\Auth;

use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolesPermisos extends Controller
{

    function crear_y_asignar()
    {
        $role = Role::findOrCreate('writer');
        $permission = Permission::findOrCreate('edit.articles');
        $role->givePermissionTo($permission);

        $role->getPermissionNames();

        return response()->json([
            "data" => [$role, $permission]
        ]);
    }

    function asignar_permisos_usuario()
    {

        $user = auth()->user();
        $user->syncRoles(['writer']);

        $permission = Permission::findOrCreate('edit.articles', 'web');
        $user->givePermissionTo($permission);

        $permissionNames = $user->getPermissionNames(); // collection of name strings
        $permissions = $user->permissions; // collection of permission objects

        $permissions1 = $user->getDirectPermissions();
        $permissions2 = $user->getPermissionsViaRoles();
        $permissions3 = $user->getAllPermissions();

        // get the names of the user's roles
        $roles = $user->getRoleNames(); // Returns a collection

        return response()->json([
            "data" => [$permissionNames, $permissions, $permissions1, $permissions2, $permissions3, $roles]
        ]);
    }
}
