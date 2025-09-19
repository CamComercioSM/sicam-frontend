<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddTeamIdToRolesAndPermissionsTables extends Migration
{
    public function up()
    {
        Schema::table('roles', function (Blueprint $table) {
            $table->unsignedBigInteger('team_id')->nullable()->after('id');
        });

        Schema::table('model_has_roles', function (Blueprint $table) {
            $table->unsignedBigInteger('team_id')->nullable()->after('role_id');
        });

        Schema::table('model_has_permissions', function (Blueprint $table) {
            $table->unsignedBigInteger('team_id')->nullable()->after('permission_id');
        });
    }

    public function down()
    {
        Schema::table('roles', function (Blueprint $table) {
            $table->dropColumn('team_id');
        });

        Schema::table('model_has_roles', function (Blueprint $table) {
            $table->dropColumn('team_id');
        });

        Schema::table('model_has_permissions', function (Blueprint $table) {
            $table->dropColumn('team_id');
        });
    }
}