<?php

namespace App\Http\Controllers;

use App\Models\Clothing;
use Illuminate\Http\Request;

class ClothingController extends Controller
{
    public function index()
    {
        return response()->json(
            Clothing::with('branch')->get()
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string|max:100',
            'size' => 'required|string|max:50',
            'color' => 'required|string|max:100',
            'unique_number' => 'required|string|max:100|unique:clothing,unique_number',
            'status' => 'nullable|string|max:50',
            'price' => 'nullable|numeric|min:0',
            'rental_price' => 'nullable|numeric|min:0',
            'branch_id' => 'nullable|exists:branches,id',
        ]);

        $clothing = Clothing::create($validated);

        return response()->json($clothing, 201);
    }

    public function show(Clothing $clothing)
    {
        return response()->json($clothing);
    }

    public function update(Request $request, Clothing $clothing)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'type' => 'sometimes|required|string|max:100',
            'size' => 'sometimes|required|string|max:50',
            'color' => 'sometimes|required|string|max:100',
            'unique_number' => 'sometimes|required|string|max:100|unique:clothing,unique_number,' . $clothing->id,
            'status' => 'sometimes|string|max:50',
            'price' => 'nullable|numeric|min:0',
            'rental_price' => 'nullable|numeric|min:0',
            'branch_id' => 'nullable|exists:branches,id',
        ]);

        $clothing->update($validated);

        return response()->json($clothing);
    }

    public function destroy(Clothing $clothing)
    {
        $clothing->delete();

        return response()->json([
            'message' => 'Clothing deleted successfully',
        ]);
    }
}