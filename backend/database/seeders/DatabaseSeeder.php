<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */

        public function run(): void
{
    // المستخدم
    User::factory()->create([
        'name' => 'Admin',
        'email' => 'admin@example.com',
    ]);

    // =========================
    // الفروع
    // =========================

    $branch1 = \App\Models\Branch::create([
        'name' => 'فرع مكناس',
        'city' => 'مكناس',
        'address' => 'وسط المدينة',
        'phone' => '0611111111',
        'is_active' => true,
    ]);

    $branch2 = \App\Models\Branch::create([
        'name' => 'فرع الرباط',
        'city' => 'الرباط',
        'address' => 'حي أكدال',
        'phone' => '0622222222',
        'is_active' => true,
    ]);

    $branch3 = \App\Models\Branch::create([
        'name' => 'فرع طنجة',
        'city' => 'طنجة',
        'address' => 'وسط طنجة',
        'phone' => '0633333333',
        'is_active' => false,
    ]);

    // =========================
    // الموظفين
    // =========================

    \App\Models\Employee::create([
        'name' => 'أحمد',
        'phone' => '0644444444',
        'role' => 'manager',
        'branch_id' => $branch1->id,
    ]);

    \App\Models\Employee::create([
        'name' => 'سارة',
        'phone' => '0655555555',
        'role' => 'employee',
        'branch_id' => $branch2->id,
    ]);

    // =========================
    // الزبناء
    // =========================

    $client1 = \App\Models\Client::create([
        'name' => 'مدرسة الأمل',
        'phone' => '0666666666',
        'city' => 'مكناس',
        'type' => 'organization',
    ]);

    $client2 = \App\Models\Client::create([
        'name' => 'سارة العلوي',
        'phone' => '0677777777',
        'city' => 'طنجة',
        'type' => 'individual',
    ]);

    $client3 = \App\Models\Client::create([
        'name' => 'كلية العلوم',
        'phone' => '0688888888',
        'city' => 'الرباط',
        'type' => 'organization',
    ]);

    $client4 = \App\Models\Client::create([
        'name' => 'محمد أمين',
        'phone' => '0699999999',
        'city' => 'الدار البيضاء',
        'type' => 'individual',
    ]);

    // =========================
    // اللباس
    // =========================

    \App\Models\Clothing::create([
        'name' => 'روب تخرج أسود',
        'type' => 'روب تخرج',
        'size' => 'M',
        'color' => 'أسود',
        'unique_number' => 'GOWN-001',
        'status' => 'available',
        'price' => 850,
        'rental_price' => 250,
        'branch_id' => $branch1->id,
    ]);

    \App\Models\Clothing::create([
        'name' => 'روب تخرج أسود',
        'type' => 'روب تخرج',
        'size' => 'L',
        'color' => 'أسود',
        'unique_number' => 'GOWN-002',
        'status' => 'reserved',
        'price' => 850,
        'rental_price' => 250,
        'branch_id' => $branch1->id,
    ]);

    \App\Models\Clothing::create([
        'name' => 'روب تخرج أزرق',
        'type' => 'روب تخرج',
        'size' => 'M',
        'color' => 'أزرق',
        'unique_number' => 'GOWN-003',
        'status' => 'rented',
        'price' => 900,
        'rental_price' => 300,
        'branch_id' => $branch2->id,
    ]);

    \App\Models\Clothing::create([
        'name' => 'قبعة تخرج',
        'type' => 'قبعة',
        'size' => 'M',
        'color' => 'أسود',
        'unique_number' => 'CAP-001',
        'status' => 'available',
        'price' => 150,
        'rental_price' => 50,
        'branch_id' => $branch1->id,
    ]);

    \App\Models\Clothing::create([
        'name' => 'روب تخرج أبيض',
        'type' => 'روب تخرج',
        'size' => 'XL',
        'color' => 'أبيض',
        'unique_number' => 'GOWN-004',
        'status' => 'cleaning',
        'price' => 950,
        'rental_price' => 300,
        'branch_id' => $branch2->id,
    ]);

    // =========================
    // الطلبات
    // =========================

    $order1 = \App\Models\Order::create([
        'reference' => 'ORD-0001',
        'client_id' => $client1->id,
        'branch_id' => $branch1->id,
        'employee_id' => 1,
        'type' => 'rental',
        'status' => 'reserved',
        'reservation_date' => '2026-08-15',
        'delivery_date' => '2026-08-20',
        'return_date' => '2026-08-22',
        'total_amount' => 4500,
        'paid_amount' => 2000,
    ]);

    $order2 = \App\Models\Order::create([
        'reference' => 'ORD-0002',
        'client_id' => $client2->id,
        'branch_id' => $branch2->id,
        'employee_id' => 2,
        'type' => 'sale',
        'status' => 'new',
        'reservation_date' => '2026-08-15',
        'delivery_date' => '2026-08-21',
        'return_date' => null,
        'total_amount' => 850,
        'paid_amount' => 850,
    ]);

    $order3 = \App\Models\Order::create([
        'reference' => 'ORD-0003',
        'client_id' => $client3->id,
        'branch_id' => $branch2->id,
        'employee_id' => 2,
        'type' => 'rental',
        'status' => 'completed',
        'reservation_date' => '2026-08-17',
        'delivery_date' => '2026-08-18',
        'return_date' => '2026-08-20',
        'total_amount' => 6200,
        'paid_amount' => 6200,
    ]);

    $order4 = \App\Models\Order::create([
        'reference' => 'ORD-0004',
        'client_id' => $client4->id,
        'branch_id' => $branch1->id,
        'employee_id' => 1,
        'type' => 'rental',
        'status' => 'cancelled',
        'reservation_date' => '2026-08-20',
        'delivery_date' => '2026-08-25',
        'return_date' => '2026-08-27',
        'total_amount' => 1200,
        'paid_amount' => 0,
    ]);

    // =========================
    // تفاصيل الطلبات
    // =========================

    \App\Models\OrderItem::create([
        'order_id' => $order1->id,
        'clothing_id' => 1,
        'price' => 250,
    ]);

    \App\Models\OrderItem::create([
        'order_id' => $order2->id,
        'clothing_id' => 3,
        'price' => 850,
    ]);

    \App\Models\OrderItem::create([
        'order_id' => $order3->id,
        'clothing_id' => 4,
        'price' => 6200,
    ]);
    }
}

