<?php

namespace App\Http\Controllers\apps;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class UserList extends Controller
{
  public function index()
  {

    print_r($this);

    return view('content.apps.app-user-list');
  }
}
