<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Clothing extends Model
{
    protected $table = 'clothing';

    protected $fillable = [
        'name',
        'type',
        'size',
        'color',
        'unique_number',
        'status',
        'price',
        'rental_price',
        'branch_id',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'rental_price' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }
}