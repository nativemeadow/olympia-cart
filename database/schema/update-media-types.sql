UPDATE media_associations
SET
    mediable_type = 'products'
WHERE
    mediable_type = 'App\Models\Product';

UPDATE media_associations
SET
    mediable_type = 'categories'
WHERE
    mediable_type = 'App\Models\Category';

UPDATE media_associations
SET
    mediable_type = 'product_variants'
WHERE
    mediable_type = 'App\Models\ProductVariant';