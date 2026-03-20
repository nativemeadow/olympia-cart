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
            ->selectRaw('*, ts_rank(search_vector, websearch_to_tsquery(\'english\', ?)) as rank', [$searchTerm])
            ->whereRaw('search_vector @@ websearch_to_tsquery(\'english\', ?)', [$searchTerm])
            ->orderBy('rank', 'desc')
            ->get();
    }
}
