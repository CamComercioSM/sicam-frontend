<?php

namespace App\Http\Controllers\usuarios;

use App\Actions\Fortify\PasswordValidationRules;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Str;
use Illuminate\Contracts\View\View;

class GestionUsuarios extends Controller
{

  /**
   * Redirect to user-management view.
   *
   */
  public function PanelUsuarios(): View
  {
    // dd('UserManagement');
    $users = User::all();
    $roles = Role::all();
    $userCount = $users->count();
    $verified = User::whereNotNull('email_verified_at')->get()->count();
    $notVerified = User::whereNull('email_verified_at')->get()->count();
    $usersUnique = $users->unique(['email']);
    $userDuplicates = $users->diff($usersUnique)->count();

    return view('seguridad.gestion-usuarios', [
      'totalUser' => $userCount,
      'roles' => $roles,
      'verified' => $verified,
      'notVerified' => $notVerified,
      'userDuplicates' => $userDuplicates,
    ]);
  }

  /**
   * Display a listing of the resource.
   *
   * @return \Illuminate\Http\Response
   */
  public function index(Request $request): JsonResponse
  {
    $columns = [
      1 => 'id',
      2 => 'name',
      3 => 'user',
      4 => 'email',
      5 => 'email_verified_at',
      6 => 'userRole',
      6 => 'estado',
    ];

    $totalData = User::count(); // Total records without filtering
    $totalFiltered = $totalData;

    $limit = $request->input('length');
    $start = $request->input('start');
    $order = $columns[$request->input('order.0.column')] ?? 'id';
    $orderRole = $request->input('columns')[6]['search']['value'] ?? null;
    $orderEstado = $request->input('columns')[7]['search']['value'] ?? null;
    $dir = $request->input('order.0.dir') ?? 'desc';


    $query = User::query();

    // Search handling
    if (!empty($request->input('search.value'))) {
      $search = $request->input('search.value');

      $query->where(function ($q) use ($search) {
        $q->where('id', 'LIKE', "%{$search}%")
          ->orWhere('name', 'LIKE', "%{$search}%")
          ->orWhere('email', 'LIKE', "%{$search}%");
      });
    }

    if ($orderRole) {
      $orderRole = trim($orderRole, '^$');
      if (strtolower($orderRole) === 'sin rol') {
        // Usuarios sin roles asignados
        $query->whereDoesntHave('roles');
      } else {
        // Usuarios con un rol específico
        $query->whereHas('roles', function ($q) use ($orderRole) {
          $q->where('name', 'LIKE', "%{$orderRole}%");
        });
      }
    }
    if ($orderEstado) {
      $orderEstado = trim($orderEstado, '^$');
      if (strtolower($orderEstado) === 'sin estado') {
        // Usuarios sin roles asignados
        $query->whereNull('estado');
      } else {
        // Usuarios con un rol específico
        $query->where('estado',$orderEstado);
      }
    }

    $totalFiltered = $query->count();

    $users = $query->offset($start)
      ->limit($limit)
      ->orderBy($order, $dir)
      ->get();

    $data = [];
    $ids = $start;

    foreach ($users as $user) {
      $userRole = $user->getRoleNames()->first() ?? 'Sin Rol';
      $data[] = [
        'id' => $user->id,
        'fake_id' => ++$ids,
        'name' => $user->name,
        'email' => $user->email,
        'identificacion' => $user->identificacion,
        'userRole' => $userRole,
        'estado' => $user->estado,
        'email_verified_at' => $user->email_verified_at,
        'updated_at' => $user->updated_at,
        'updated_by' => User::find($user->updated_by)?->name ?? 'N/A',
        'userProfilePhoto' => $user->profile_photo_path,
      ];
    }

    // ✅ Always return full DataTables structure, even if no results
    return response()->json([
      'draw' => intval($request->input('draw')),
      'recordsTotal' => intval($totalData),
      'recordsFiltered' => intval($totalFiltered),
      'data' => $data,
    ]);
  }

  /**
   * Show the form for creating a new resource.
   *
   * @return \Illuminate\Http\Response
   */
  public function create()
  {
    //
  }

  /**
   * Store a newly created resource in storage.
   *
   * @param  \Illuminate\Http\Request  $request
   * @return \Illuminate\Http\Response
   */
  public function store(Request $request)
  {

    $validacion = $request->validate([
      'name'      => 'required|string|max:255',
      'email'     => 'required|email',
      'userRole'  => 'required|string|exists:roles,name',
      'personaIDENTIFICACION' => 'required|string|min:4|max:12',
    ]);

    $userID = $request->id;
    $emailExists = User::where('email', $request->email)
      ->where('id', '!=', $userID)
      ->value('name');       
    if ($emailExists) {
      return response()->json([
        'TIPO' => 'ERROR',
        'MENSAJE' => "El correo ya existe, está asignado a otro usuario [{$emailExists}]."
      ]);
    }
    $identificacionExists = User::where('identificacion', Str::upper($request->personaIDENTIFICACION))
      ->where('id', '!=', $userID)
      ->value('name');
    if ($identificacionExists) {
      return response()->json([
        'TIPO' => 'ERROR',
        'MENSAJE' => "La identificación ya existe, está asignada a otro usuario [{$identificacionExists}]."
      ]);
    }

    if ($userID) {

      $user = User::findOrFail($userID);


      $oldEmail = $user->email;
      $oldIdentificacion = $user->identificacion;

      $user->update([
        'name'  => $request->name,
        'email' => $request->email,
        'identificacion'   => Str::upper($request->personaIDENTIFICACION),
      ]);
      // 🔹 Actualizar rol
      $user->syncRoles($request->userRole);
      // 🔹 Si cambió el correo, volver a disparar el evento Registered
      if ($oldEmail !== $user->email) {
        event(new Registered($user));
      }
      if ($oldIdentificacion !== $user->identificacion) {
        // Aquí puedes agregar cualquier lógica adicional que necesites
        // cuando la identificación del usuario cambie.
        $user->password = bcrypt($request->personaIDENTIFICACION);
        $user->save();
      }
      return response()->json('Updated');
    } else {

      // Crear usuario
      $user = User::create([
        'name'              => $request->name,
        'email'             => $request->email,
        'password'          => bcrypt($request->personaIDENTIFICACION),
        'identificacion'   => Str::upper($request->personaIDENTIFICACION),
      ]);

      // Asignar rol
      $user->syncRoles($request->userRole);

      // Lanzar evento de registro (para disparar listeners como verificación, etc)
      event(new Registered($user));

      // user created
      return response()->json('Created');
    }
  }

  /**
   * Display the specified resource.
   *
   * @param  int  $id
   * @return \Illuminate\Http\Response
   */
  public function show($id)
  {
    //
  }

  /**
   * Show the form for editing the specified resource.
   *
   * @param  int  $id
   * @return \Illuminate\Http\Response
   */
  public function edit($id): JsonResponse
  {
    $user = User::findOrFail($id);
    $user->userRole = $user->getRoleNames()->first() ?? 'Sin Rol';
    return response()->json($user);
  }

  /**
   * Update the specified resource in storage.
   *
   * @param  \Illuminate\Http\Request  $request
   * @param  int  $id
   * @return \Illuminate\Http\Response
   */
  public function update(Request $request, $id): JsonResponse
  {
    $user = User::findOrFail($id);

    // Validamos que venga el campo estado y que sea uno de los permitidos
    $request->validate([
      'estado' => 'required|in:activo,desactivo,borrado',
    ]);

    // Actualizamos el estado
    $user->estado = $request->estado;
    $user->save();

    return response()->json([
      'message' => "Usuario {$user->name} actualizado con estado {$user->estado}",
    ]);
  }


  /**
   * Remove the specified resource from storage.
   *
   * @param  int  $id
   * @return \Illuminate\Http\Response
   */
  public function destroy($id)
  {
    $oBJuSER = User::find($id);
    if ($oBJuSER) {
      $oBJuSER->estado = 'borrado';
      $oBJuSER->save();
      $oBJuSER->delete();
    }

    return response()->json('Deleted');
  }


  public function desactivar($id): JsonResponse
  {

    $oBJuSER = User::find($id);
    if ($oBJuSER) {
      $oBJuSER->estado = 'desactivar';
      $oBJuSER->save();
    }

    return response()->json('Desactivated');
  }
}
