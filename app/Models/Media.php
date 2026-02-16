<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Media extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'alt_text',
        'file_path',
        'file_name',
        'mime_type',
        'size',
        'disk',
        'type',
    ];
}
