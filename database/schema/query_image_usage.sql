SELECT
    'category' AS record_type,
    c.id,
    c.title,
    c.slug,
    c.image AS image_filename,
    -- This CASE statement creates the flag.
    -- If the LEFT JOIN finds a match, m.id will not be NULL.
    CASE
        WHEN m.id IS NOT NULL THEN 'true'
        ELSE 'false'
    END AS image_exists_in_media
FROM
    categories c
    LEFT JOIN media m ON c.image = m.file_name
UNION ALL
SELECT
    'product' AS record_type,
    p.id,
    p.title,
    p.slug,
    p.image AS image_filename,
    -- Same logic for products.
    CASE
        WHEN m.id IS NOT NULL THEN 'true'
        ELSE 'false'
    END AS image_exists_in_media
FROM
    products p
    LEFT JOIN media m ON p.image = m.file_name
UNION ALL
SELECT
    'product variant' AS record_type,
    p.id,
    p.title,
    p.slug,
    av.value AS image_filename,
    -- Flag to check if the image file name exists in the media table
    CASE
        WHEN m.id IS NOT NULL THEN 'true'
        ELSE 'false'
    END AS image_exists_in_media
FROM
    product_variants pv
    -- We only care about variants that have an 'image' attribute, so INNER JOIN is appropriate
    JOIN attribute_value_product_variant avpv ON pv.id = avpv.product_variant_id
    JOIN attribute_values av ON avpv.attribute_value_id = av.id
    JOIN attributes a ON av.attribute_id = a.id
    -- Join back to the parent product to get its name/info
    JOIN products p ON pv.product_id = p.id
    -- Use a LEFT JOIN for the final check against the media table
    LEFT JOIN media m ON av.value = m.file_name
WHERE
    a.name = 'Image';