<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    // POST [name, email, password]
    public function register(Request $request)
    {
        // Validation
        try {
            $request->validate([
                "name" => "required|string",
                "email" => "required|string|email|unique:users",
                "password" => "required|confirmed" // password_confirmation
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                "message" => "Los datos enviados no son válidos.",
            ], 422);
        }

        // Create User
        User::create([
            "name" => $request->name,
            "email" => $request->email,
            "password" => bcrypt($request->password)
        ]);

        return response()->json([
            "status" => true,
            "message" => "User registered successfully",
            "data" => []
        ]);
    }

    public function login(Request $request)
    {
        // POST [email, password]
        // Validation
        $request->validate([
            'email' => 'required|email|string',
            'password' => 'required'
        ]);

        // Email check
        $user = User::where("email", $request->email)->first();

        if (!empty($user)) {
            // User exists
            if (Hash::check($request->password, $user->password)) {
                // Password matched
                $token = $user->createToken("myAccessToken")->plainTextToken;

                return response()->json([
                    "status" => true,
                    "message" => "Login successful",
                    "token" => $token,
                    "data" => []
                ]);
            } else {
                return response()->json([
                    "status" => false,
                    "message" => "Password didn't match",
                    "data" => []
                ]);
            }
        } else {
            return response()->json([
                "status" => false,
                "message" => "Invalid Email value",
                "data" => []
            ]);
        }
    }

    public function profile()
    {
        $userData = auth()->user();

        return response()->json([
            "status" => true,
            "message" => "Profile information",
            "data" => $userData,
            "id" => auth()->user()->id
        ]);
    }

    public function logout()
    {
        auth()->user()->tokens()->delete();

        return response()->json([
            "status" => true,
            "message" => "User Logged out successfully",
            "data" => []
        ]);
    }

    function borrar_usuario(Request $request)
    {

        $oBJuSER = User::find($request->xxxx);


        if ($oBJuSER) {
            $oBJuSER->delete();
        }


        return response()->json([
            "message" => "usuario borrado",
            "data" => [$oBJuSER, $oBJuSER->id]
        ]);
    }

    function eliminar_usuario(Request $request)
    {

        $oBJuSER = User::withTrashed()->where('id', $request->xxxx )->first();


        if ($oBJuSER) {
            $oBJuSER->forceDelete();
        }


        return response()->json([
            "message" => "usuario borrado",
            "data" => [$oBJuSER]
        ]);
    }
}
