<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class SearchIndexView extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'search_index_view';

    /**
     * The primary key for the model.
     *
     * @var string
     */
    protected $primaryKey = 'id';

    /**
     * The "type" of the primary key ID.
     *
     * @var string
     */
    protected $keyType = 'string';

    /**
     * Indicates if the IDs are auto-incrementing.
     *
     * @var bool
     */
    public $incrementing = false;

    /**
     * Get the parent searchable model (product, product variant, etc.).
     */
    public function searchable(): MorphTo
    {
        return $this->morphTo(__FUNCTION__, 'source_table', 'source_id');
    }
}
