<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use Illuminate\Http\Request;

class ExpenseController extends Controller
{
    public function index()
    {
        return response()->json(
            Expense::with(['branch', 'employee'])->latest()->get()
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'branch_id' => 'required|exists:branches,id',
            'employee_id' => 'nullable|exists:employees,id',
            'amount' => 'required|numeric|min:0',
            'category' => 'required|string',
            'description' => 'nullable|string',
            'expense_date' => 'nullable|date',
        ]);

        $expense = Expense::create($validated);

        return response()->json(
            $expense->load(['branch', 'employee']),
            201
        );
    }

    public function show(Expense $expense)
    {
        return response()->json(
            $expense->load(['branch', 'employee'])
        );
    }

    public function update(Request $request, Expense $expense)
    {
        $validated = $request->validate([
            'branch_id' => 'sometimes|exists:branches,id',
            'employee_id' => 'nullable|exists:employees,id',
            'amount' => 'sometimes|numeric|min:0',
            'category' => 'sometimes|string',
            'description' => 'nullable|string',
            'expense_date' => 'nullable|date',
        ]);

        $expense->update($validated);

        return response()->json(
            $expense->load(['branch', 'employee'])
        );
    }

    public function destroy(Expense $expense)
    {
        $expense->delete();

        return response()->json([
            'message' => 'تم حذف المصروف بنجاح',
        ]);
    }
}
