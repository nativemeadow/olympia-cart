WITH RECURSIVE
    category_hierarchy (id, title, slug, parent_id, "order", level, path) AS (
        -- 1. Base Case: Find root categories
        SELECT
            c.id,
            c.title,
            c.slug,
            cc.parent_id,
            cc."order",
            0 AS level,
            c.title AS path
        FROM
            categories c
            JOIN category_category cc ON c.id = cc.child_id
        WHERE
            cc.parent_id IS NULL
        UNION ALL
        -- 2. Recursive Step: Join children to their parents
        SELECT
            child.id,
            child.title,
            child.slug,
            parent_hierarchy.id AS parent_id,
            cc."order",
            parent_hierarchy.level + 1,
            parent_hierarchy.path || ' > ' || child.title
        FROM
            categories AS child
            JOIN category_category AS cc ON child.id = cc.child_id
            JOIN category_hierarchy AS parent_hierarchy ON cc.parent_id = parent_hierarchy.id
    )
    -- 3. Final Selection: Join hierarchy with products
SELECT
    ch."order",
    ch.level,
    ch.path,
    ch.parent_id,
    ch.id AS category_id,
    c.title AS category_title,
    c.uuid AS category_uuid,
    c.slug AS category_slug,
    c.description AS category_description,
    cp.product_id AS product_id,
    cp.product_order AS product_order,
    p.status AS product_status,
    p.uuid AS product_uuid,
    p.title AS product_title,
    p.slug AS product_slug,
    p.description AS product_description,
    p.sku AS product_sku,
    p.image AS product_image,
    pv.id AS variant_id,
    pv.sku AS variant_sku,
    pv.price AS variant_price,
    mapv.media_id AS variant_media_id,
    mapv.mediable_type AS variant_media_type,
    mapv.order AS variant_media_order,
    mv.title AS variant_image_title,
    mv.description AS variant_image_description,
    mv.alt_text AS variant_image_alt_text,
    mv.file_path AS variant_image_file_path,
    mv.file_name AS variant_image_file_name,
    mv.size AS variant_image_file_size,
    mv.type AS variant_image_file_type,
    avpv.product_variant_id AS product_variant_id,
    attr.id as attribute_id,
    attr.name AS attribute_name,
    attr.data_type AS attribute_data_type,
    attr.list_of_values AS attribute_list_of_values,
    av.value AS attribute_value,
    ma.media_id AS media_id,
    ma.mediable_type AS media_type,
    ma.order AS media_order,
    m.title AS image_title,
    m.description AS image_description,
    m.alt_text AS image_alt_text,
    m.file_path AS image_file_path,
    m.file_name AS image_file_name,
    m.size AS image_file_size,
    m.type AS image_file_type
FROM
    category_hierarchy ch
    LEFT JOIN category_product cp ON ch.id = cp.category_id
    LEFT JOIN categories c ON ch.id = c.id
    LEFT JOIN products p ON cp.product_id = p.id
    LEFT JOIN product_variants pv ON p.id = pv.product_id
    LEFT JOIN attribute_value_product_variant as avpv on avpv.product_variant_id = pv.id
    LEFT JOIN attribute_values av on av.id = avpv.attribute_value_id
    LEFT JOIN public.attributes attr on attr.id = av.attribute_id
    LEFT JOIN media_associations ma ON ma.mediable_id = p.id
    LEFT JOIN media m ON ma.media_id = m.id
    LEFT JOIN media_associations mapv ON mapv.mediable_id = pv.id
    LEFT JOIN media mv ON mapv.media_id = mv.id
ORDER BY
    ch."order",
    product_order ASC,
    ch.path;