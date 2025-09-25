<?php

namespace App\Http\Controllers\usuarios;

use App\Http\Controllers\Controller;
use App\Models\Session;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Role;
use App\Models\Team;

use Illuminate\Auth\Events\Registered;
use Illuminate\Contracts\View\View;


class UserManagement extends Controller
{
  /**
   * Redirect to user-management view.
   *
   */
  public function UserManagement(): View
  {
    // dd('UserManagement');
    $users = User::all();
    $roles = Role::all(['id', 'name']);
    $userCount = $users->count();
    $verified = User::whereNotNull('email_verified_at')->get()->count();
    $notVerified = User::whereNull('email_verified_at')->get()->count();
    $usersUnique = $users->unique(['email']);
    $userDuplicates = $users->diff($usersUnique)->count();

    // ¿Cuántos usuarios activos?
    $totalSesiones = (Session::all())->count();

    //$sesiones = 
    return view('superuser.usuarios.gestion', [
      'totalUser' => $userCount,
      'roles' => $roles,
      'verified' => $verified,
      'notVerified' => $notVerified,
      'userDuplicates' => $userDuplicates,
      'totalSesiones' => $totalSesiones
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
      3 => 'email',
      4 => 'role',
      5 => 'email_verified_at',
      6 => 'userProfilePhoto'
    ];

    $totalData = User::count(); // Total records without filtering
    $totalFiltered = $totalData;

    $limit = $request->input('length');
    $start = $request->input('start');
    $order = $columns[$request->input('order.0.column')] ?? 'id';
    $dir = $request->input('order.0.dir') ?? 'desc';

    $query = User::query();

    // FILTRO POR ROL
    $roleFilter = $request->input('columns')[6]['search']['value'] ?? null;
    if ($roleFilter) {
      $roleFilter = trim($roleFilter, '^$');
      if ($roleFilter === 'Sin Rol') {
        // Usuarios que NO tienen roles
        $query->whereDoesntHave('roles');
      } else {
        $query->whereHas('roles', function ($q) use ($roleFilter) {
          $q->where('name', $roleFilter);
        });
      }
    }
    // Search handling
    if (!empty($request->input('search.value'))) {
      $search = $request->input('search.value');

      $query->where(function ($q) use ($search) {
        $q->where('id', 'LIKE', "%{$search}%")
          ->orWhere('name', 'LIKE', "%{$search}%")
          ->orWhere('email', 'LIKE', "%{$search}%")
          ->orWhere('email_verified_at', 'LIKE', "%{$search}%")
          ->orWhere('role', 'LIKE', "%{$search}%");
      });
      $totalFiltered = $query->count();
    }

    $users = $query->with('roles')
      ->offset($start)
      ->limit($limit)
      ->orderBy($order, $dir)
      ->get();

    $data = [];
    $ids = $start;

    foreach ($users as $user) {
      $roleName = $user->roles->pluck('name')->first() ?? 'Sin Rol';
      $data[] = [
        'id' => $user->id,
        'fake_id' => ++$ids,
        'name' => $user->name,
        'email' => $user->email,
        'userRole' => $roleName,
        'email_verified_at' => $user->email_verified_at,
        'userProfilePhoto' => $user->profile_photo_path
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
    $userID = $request->id;
    // Validación rápida
    $request->validate([
      'name'      => 'required|string|max:255',
      'email'     => 'required|email|unique:users,email',
      'userRole'  => 'required|string|exists:roles,name',
      'personaIDENTIFICACION' => 'required|string|min:4',
    ]);

    if ($userID) {
      // update the value
      $user = User::updateOrCreate(
        ['id' => $userID],
        ['name' => $request->name, 'email' => $request->email]
      );

      // Asignar el rol (solo si el campo viene en el request)
      if ($request->has('userRole')) {
        $user->syncRoles($request->userRole); // Reemplaza los roles previos por el nuevo
      }
      // user updated
      return response()->json('Updated');
    } else {

      $team = Team::find(1);
      // Crear usuario
      $user = User::create([
        'name'              => $request->name,
        'email'             => $request->email,
        'password'          => bcrypt($request->personaIDENTIFICACION),
        'current_team_id'   => $team->id
      ]);

      // Asignar rol
      $user->syncRoles($request->userRole);

      // Asociar equipo y cambiar equipo activo
      if ($team && !$user->teams->contains($team->id)) {
        $user->teams()->attach($team->id);
        $user->refresh();
        $user->switchTeam($team);
      }

      // Lanzar evento de registro (para disparar listeners como verificación, etc)
      event(new Registered($user));

      // (Opcional) Loguear al usuario automáticamente después de crear
      // Auth::login($user);

      // Enviar correo de verificación explícitamente
      //$user->sendEmailVerificationNotification();

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
    return response()->json($user);
  }

  /**
   * Update the specified resource in storage.
   *
   * @param  \Illuminate\Http\Request  $request
   * @param  int  $id
   * @return \Illuminate\Http\Response
   */
  public function update(Request $request, $id) {}

  /**
   * Remove the specified resource from storage.
   *
   * @param  int  $id
   * @return \Illuminate\Http\Response
   */
  public function destroy($id)
  {
    $users = User::where('id', $id)->delete();
  }
}
