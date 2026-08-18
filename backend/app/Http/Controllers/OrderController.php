<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Clothing;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    // جميع الطلبات
    public function index()
    {
        $orders = Order::with([
            'client',
            'branch',
            'employee',
            'items.clothing',
            'payments',
            'deliveries',
        ])
        ->latest()
        ->get();

        return response()->json($orders);
    }

    // إضافة طلب جديد
    public function store(Request $request)
    {
        $validated = $request->validate([
            'reference' => 'required|string|unique:orders,reference',
            'client_id' => 'required|exists:clients,id',
            'branch_id' => 'required|exists:branches,id',
            'employee_id' => 'nullable|exists:employees,id',
            'type' => 'required|in:rental,sale',
            'status' => 'nullable|string',
            'reservation_date' => 'nullable|date',
            'delivery_date' => 'nullable|date',
            'return_date' => 'nullable|date',
            'total_amount' => 'required|numeric|min:0',
            'paid_amount' => 'nullable|numeric|min:0',
            'items' => 'required|array|min:1',
            'items.*.clothing_id' => 'required|exists:clothing,id',
            'items.*.price' => 'required|numeric|min:0',
        ]);

        $order = DB::transaction(function () use ($validated) {

            $order = Order::create([
                'reference' => $validated['reference'],
                'client_id' => $validated['client_id'],
                'branch_id' => $validated['branch_id'],
                'employee_id' => $validated['employee_id'] ?? null,
                'type' => $validated['type'],
                'status' => $validated['status'] ?? 'new',
                'reservation_date' => $validated['reservation_date'] ?? null,
                'delivery_date' => $validated['delivery_date'] ?? null,
                'return_date' => $validated['return_date'] ?? null,
                'total_amount' => $validated['total_amount'],
                'paid_amount' => $validated['paid_amount'] ?? 0,
            ]);

            foreach ($validated['items'] as $item) {

                OrderItem::create([
                    'order_id' => $order->id,
                    'clothing_id' => $item['clothing_id'],
                    'price' => $item['price'],
                ]);

                $clothing = Clothing::find($item['clothing_id']);

                if ($validated['type'] === 'rental') {
                    $clothing->update([
                        'status' => 'reserved',
                    ]);
                }
            }

            return $order;
        });

        return response()->json(
            $order->load([
                'client',
                'branch',
                'employee',
                'items.clothing',
                'payments',
                'deliveries',
            ]),
            201
        );
    }

    // عرض طلب واحد
    public function show(Order $order)
    {
        return response()->json(
            $order->load([
                'client',
                'branch',
                'employee',
                'items.clothing',
                'payments',
                'deliveries',
            ])
        );
    }

    // تعديل الطلب
    public function update(Request $request, Order $order)
    {
        $validated = $request->validate([
            'reference' => 'sometimes|string|unique:orders,reference,' . $order->id,
            'client_id' => 'sometimes|exists:clients,id',
            'branch_id' => 'sometimes|exists:branches,id',
            'employee_id' => 'nullable|exists:employees,id',
            'type' => 'sometimes|in:rental,sale',
            'status' => 'sometimes|string',
            'reservation_date' => 'nullable|date',
            'delivery_date' => 'nullable|date',
            'return_date' => 'nullable|date',
            'total_amount' => 'sometimes|numeric|min:0',
            'paid_amount' => 'sometimes|numeric|min:0',
        ]);

        $order->update($validated);

        return response()->json(
            $order->load([
                'client',
                'branch',
                'employee',
                'items.clothing',
                'payments',
                'deliveries',
            ])
        );
    }

    // حذف الطلب
    public function destroy(Order $order)
    {
        $order->delete();

        return response()->json([
            'message' => 'تم حذف الطلب بنجاح',
        ]);
    }
}
