<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Campo de identificación (máx 12 caracteres, indexado para búsqueda)
            $table->string('identificacion', 12)
                ->after('id');
            $table->index('identificacion', 'users_identificacion_index');

            // Campo de estado (por defecto 'activo')
            $table->enum('estado', ['activo', 'desactivo', 'borrado'])
                ->default('activo')
                ->after('email_verified_at');

            // Campo token_sican32 (tipo text con longitud 252)
            $table->text('token_sican32')
                ->nullable()
                ->after('password');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex('users_identificacion_index');
            $table->dropColumn(['identificacion', 'estado', 'token_sican32']);
        });
    }
};
