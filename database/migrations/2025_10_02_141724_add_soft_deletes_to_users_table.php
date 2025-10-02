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
            $table->timestamp('created_at')->nullable()->useCurrent()->change();
            $table->timestamp('updated_at')->nullable()->useCurrentOnUpdate()->useCurrent()->change();
            $table->softDeletes()->after('updated_at');

            $table->unsignedBigInteger('created_by')->nullable()->after('created_at');
            $table->unsignedBigInteger('updated_by')->nullable()->after('updated_at');
            $table->unsignedBigInteger('deleted_by')->nullable()->after('deleted_at'); 

            $table->index(['created_by', 'updated_by', 'deleted_by']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropSoftDeletes();
            //$table->dropIndex(['created_by', 'updated_by', 'deleted_by']);
            $table->dropColumn(['created_by', 'updated_by', 'deleted_by']);
        });
    }
};
