<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {

        // الزبناء
        Schema::table('clients', function (Blueprint $table) {
            $table->string('name')->after('id');
            $table->string('phone')->nullable()->after('name');
            $table->string('city')->nullable()->after('phone');
            $table->string('type')->default('individual')->after('city');
        });

        // الطلبات
        Schema::table('orders', function (Blueprint $table) {
            $table->string('reference')->unique()->after('id');
            $table->foreignId('client_id')->constrained('clients')->cascadeOnDelete()->after('reference');
            $table->foreignId('branch_id')->constrained('branches')->cascadeOnDelete()->after('client_id');
            $table->foreignId('employee_id')->nullable()->constrained('employees')->nullOnDelete()->after('branch_id');
            $table->string('type')->default('rental')->after('employee_id');
            $table->string('status')->default('new')->after('type');
            $table->date('reservation_date')->nullable()->after('status');
            $table->date('delivery_date')->nullable()->after('reservation_date');
            $table->date('return_date')->nullable()->after('delivery_date');
            $table->decimal('total_amount', 10, 2)->default(0)->after('return_date');
            $table->decimal('paid_amount', 10, 2)->default(0)->after('total_amount');
        });

        // تفاصيل الطلب
        Schema::table('order_items', function (Blueprint $table) {
            $table->foreignId('order_id')->constrained('orders')->cascadeOnDelete()->after('id');
            $table->foreignId('clothing_id')->constrained('clothing')->cascadeOnDelete()->after('order_id');
            $table->decimal('price', 10, 2)->default(0)->after('clothing_id');
        });

        // التسليم والاستلام
        Schema::table('deliveries', function (Blueprint $table) {
            $table->foreignId('order_id')->constrained('orders')->cascadeOnDelete()->after('id');
            $table->foreignId('branch_id')->constrained('branches')->cascadeOnDelete()->after('order_id');
            $table->foreignId('employee_id')->nullable()->constrained('employees')->nullOnDelete()->after('branch_id');
            $table->string('type')->default('delivery')->after('employee_id');
            $table->string('status')->default('pending')->after('type');
            $table->dateTime('date')->nullable()->after('status');
            $table->text('notes')->nullable()->after('date');
        });

        // الأداءات
        Schema::table('payments', function (Blueprint $table) {
            $table->foreignId('order_id')->constrained('orders')->cascadeOnDelete()->after('id');
            $table->foreignId('branch_id')->constrained('branches')->cascadeOnDelete()->after('order_id');
            $table->decimal('amount', 10, 2)->default(0)->after('branch_id');
            $table->string('method')->default('cash')->after('amount');
            $table->dateTime('payment_date')->nullable()->after('method');
            $table->text('notes')->nullable()->after('payment_date');
        });

        // المصاريف
        Schema::table('expenses', function (Blueprint $table) {
            $table->foreignId('branch_id')->constrained('branches')->cascadeOnDelete()->after('id');
            $table->foreignId('employee_id')->nullable()->constrained('employees')->nullOnDelete()->after('branch_id');
            $table->decimal('amount', 10, 2)->default(0)->after('employee_id');
            $table->string('category')->after('amount');
            $table->text('description')->nullable()->after('category');
            $table->date('expense_date')->nullable()->after('description');
        });
    }

    public function down(): void
    {
        Schema::table('expenses', function (Blueprint $table) {
            $table->dropForeign(['branch_id']);
            $table->dropForeign(['employee_id']);
            $table->dropColumn(['branch_id', 'employee_id', 'amount', 'category', 'description', 'expense_date']);
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->dropForeign(['order_id']);
            $table->dropForeign(['branch_id']);
            $table->dropColumn(['order_id', 'branch_id', 'amount', 'method', 'payment_date', 'notes']);
        });

        Schema::table('deliveries', function (Blueprint $table) {
            $table->dropForeign(['order_id']);
            $table->dropForeign(['branch_id']);
            $table->dropForeign(['employee_id']);
            $table->dropColumn(['order_id', 'branch_id', 'employee_id', 'type', 'status', 'date', 'notes']);
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->dropForeign(['order_id']);
            $table->dropForeign(['clothing_id']);
            $table->dropColumn(['order_id', 'clothing_id', 'price']);
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['client_id']);
            $table->dropForeign(['branch_id']);
            $table->dropForeign(['employee_id']);
            $table->dropUnique(['reference']);
            $table->dropColumn([
                'reference',
                'client_id',
                'branch_id',
                'employee_id',
                'type',
                'status',
                'reservation_date',
                'delivery_date',
                'return_date',
                'total_amount',
                'paid_amount'
            ]);
        });

        Schema::table('clients', function (Blueprint $table) {
            $table->dropColumn(['name', 'phone', 'city', 'type']);
        });
    }
};
