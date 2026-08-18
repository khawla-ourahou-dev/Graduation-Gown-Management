<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('clothing', function (Blueprint $table) {
            $table->string('name')->after('id');
            $table->string('type')->after('name');
            $table->string('size')->after('type');
            $table->string('color')->after('size');
            $table->string('unique_number')->unique()->after('color');
            $table->string('status')->default('available')->after('unique_number');
            $table->decimal('price', 10, 2)->nullable()->after('status');
            $table->decimal('rental_price', 10, 2)->nullable()->after('price');
            $table->foreignId('branch_id')
                ->nullable()
                ->constrained('branches')
                ->nullOnDelete()
                ->after('rental_price');
        });
    }

    public function down(): void
    {
        Schema::table('clothing', function (Blueprint $table) {
            $table->dropForeign(['branch_id']);
            $table->dropUnique(['unique_number']);
            $table->dropColumn([
                'name',
                'type',
                'size',
                'color',
                'unique_number',
                'status',
                'price',
                'rental_price',
                'branch_id',
            ]);
        });
    }
};
