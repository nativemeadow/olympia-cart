<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class SearchIndex extends Model
{
    /** @use HasFactory<\Database\Factories\SearchIndexFactory> */
    use HasFactory;
    protected $fillable = [
        "title",
        'description',
        'source_table',
        'source_id',
        'rank',
    ];

    protected $table = 'search_index';

    public function search(string $searchTerm)
    {
        return DB::table($this->table)
            ->select('*', DB::raw('rank')) // Select all columns and the FTS5 rank
            ->whereRaw('search_index MATCH ?', [$searchTerm])
            ->orderBy('rank', 'desc')
            ->get();
    }
}
