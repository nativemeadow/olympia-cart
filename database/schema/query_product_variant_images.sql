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