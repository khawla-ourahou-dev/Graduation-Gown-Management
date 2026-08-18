<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use Illuminate\Http\Request;

class EmployeeController extends Controller
{
    // جميع الموظفين
    public function index()
    {
        return response()->json(
            Employee::with('branch')->latest()->get()
        );
    }

    // إضافة موظف
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:50',
            'role' => 'required|string|max:255',
            'branch_id' => 'nullable|exists:branches,id',
        ]);

        $employee = Employee::create($validated);

        return response()->json(
            $employee->load('branch'),
            201
        );
    }

    // عرض موظف
    public function show(Employee $employee)
    {
        return response()->json(
            $employee->load('branch')
        );
    }

    // تعديل موظف
    public function update(Request $request, Employee $employee)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'phone' => 'nullable|string|max:50',
            'role' => 'sometimes|required|string|max:255',
            'branch_id' => 'nullable|exists:branches,id',
        ]);

        $employee->update($validated);

        return response()->json(
            $employee->load('branch')
        );
    }

    // حذف موظف
    public function destroy(Employee $employee)
    {
        $employee->delete();

        return response()->json([
            'message' => 'تم حذف الموظف بنجاح',
        ]);
    }
}
