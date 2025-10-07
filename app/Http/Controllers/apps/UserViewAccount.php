<?php

namespace App\Http\Controllers\apps;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class UserViewAccount extends Controller
{
  public function index(Request $request)
  {
    
    $user = User::with(['roles', 'updatedByUser'])->findOrFail($request->route('id'));
    return view('content.apps.app-user-view-account', compact('user'));
  }
}
