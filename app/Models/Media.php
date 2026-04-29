<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Media extends Model
{
    use HasFactory;

    // allow soft deletes for media, so we can keep track of deleted
    // media items and potentially restore them later
    use SoftDeletes;

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
