<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function index()
    {
        return response()->json(
            Payment::with(['order', 'branch'])->latest()->get()
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'order_id' => 'required|exists:orders,id',
            'branch_id' => 'required|exists:branches,id',
            'amount' => 'required|numeric|min:0',
            'method' => 'required|string',
            'payment_date' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);

        $payment = Payment::create($validated);

        return response()->json(
            $payment->load(['order', 'branch']),
            201
        );
    }

    public function show(Payment $payment)
    {
        return response()->json(
            $payment->load(['order', 'branch'])
        );
    }

    public function update(Request $request, Payment $payment)
    {
        $validated = $request->validate([
            'order_id' => 'sometimes|exists:orders,id',
            'branch_id' => 'sometimes|exists:branches,id',
            'amount' => 'sometimes|numeric|min:0',
            'method' => 'sometimes|string',
            'payment_date' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);

        $payment->update($validated);

        return response()->json(
            $payment->load(['order', 'branch'])
        );
    }

    public function destroy(Payment $payment)
    {
        $payment->delete();

        return response()->json([
            'message' => 'تم حذف الأداء بنجاح',
        ]);
    }
}
