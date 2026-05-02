<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Support\Facades\DB;
use App\Models\ProductVariant;

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

    /**
     * Get the parent model that is being indexed (Product, ProductVariant, etc.).
     * This defines a polymorphic relationship.
     */
    public function searchable(): MorphTo
    {
        // We rename 'source_table' to 'searchable_type' and 'source_id' to 'searchable_id'
        // for Laravel's convention, but we can override it.
        return $this->morphTo('searchable', 'source_table', 'source_id');
    }

    /**
     * Get the product associated with the search index entry.
     */
    public function getProductAttribute()
    {
        if ($this->source_table === 'products') {
            return $this->searchable;
        } elseif ($this->source_table === 'product_variants' && $this->searchable) {
            return $this->searchable->product;
        }
        return null;
    }

    /**
     * Performs a full-text search and returns the raw results with rank.
     *
     * @param string $searchTerm
     * @return \Illuminate\Support\Collection
     */
    public function search(string $searchTerm)
    {
        if (empty($searchTerm)) {
            return collect();
        }

        // This query uses PostgreSQL's full-text search capabilities.
        // It calculates a 'rank' for each result based on relevance.
        return self::with(['searchable' => function ($morphTo) {
            $morphTo->morphWith([
                ProductVariant::class => ['product'],
            ]);
        }])
            ->selectRaw('*, ts_rank(search_vector, websearch_to_tsquery(\'english\', ?)) as rank', [$searchTerm])
            ->whereRaw('search_vector @@ websearch_to_tsquery(\'english\', ?)', [$searchTerm])
            ->orderBy('rank', 'desc')
            ->get();
    }
}
