<?php
// app/Models/LoginCode.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LoginCode extends Model
{
    use HasFactory;
    protected $primaryKey = 'email';
    public $incrementing = false;
    protected $fillable = ['email', 'code', 'expires_at'];
    protected $casts = ['expires_at' => 'datetime'];
}
