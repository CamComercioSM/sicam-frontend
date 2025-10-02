<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AuthController;
use App\Http\Controllers\pruebas\RolesPermisos;

// Open Routes
  Route::post('register', [AuthController::class, 'register']);
  Route::post('login', [AuthController::class, 'login']);
 
  Route::post('prueba/rolesypermisos', [RolesPermisos::class, 'crear_y_asignar']);

Route::group(['middleware' => 'auth:sanctum'], function () {
  // Protected Routes  
  Route::post('crear_usuario', [AuthController::class, 'register']);
  Route::post('borrar_usuario', [AuthController::class, 'borrar_usuario']);
  Route::post('eliminar_usuario', [AuthController::class, 'eliminar_usuario']);



  Route::get('profile', [AuthController::class, 'profile']);
  Route::get('logout', [AuthController::class, 'logout']);  
  Route::post('prueba/permisosusuario', [RolesPermisos::class, 'asignar_permisos_usuario']);
});

Route::get('user', function (Request $request) {
  return $request->user();
})->middleware('auth:sanctum');
