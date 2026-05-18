INSERT INTO
    media_associations (
        media_id,
        mediable_type,
        mediable_id,
        "order",
        created_at,
        updated_at
    )
SELECT
    media.id AS media_id,
    COALESCE(
        CASE
            WHEN products.id IS NOT NULL THEN 'App\Models\Product'
        END,
        CASE
            WHEN categories.id IS NOT NULL THEN 'App\Models\Category'
        END
    ) AS mediable_type,
    COALESCE(products.id, categories.id) AS mediable_id,
    1 AS "order", -- Set a default order of 1
    NOW () AS created_at,
    NOW () AS updated_at
FROM
    media
    LEFT JOIN products ON media.file_name = products.image
    LEFT JOIN categories ON media.file_name = categories.image
WHERE
    products.id IS NOT NULL
    OR categories.id IS NOT NULL
ORDER BY
    file_path;