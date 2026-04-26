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
	pvav.product_variant_id AS product_variant_id,
	attr.id as attribute_id,
	attr.name AS attribute_name,
	av.value AS attribute_value
FROM
    category_hierarchy ch
    LEFT JOIN category_product cp ON ch.id = cp.category_id
    LEFT JOIN categories c ON ch.id = c.id
    LEFT JOIN products p ON cp.product_id = p.id
    LEFT JOIN product_variants pv ON p.id = pv.product_id
	LEFT JOIN product_variant_attribute_values pvav on pvav.product_variant_id = p.id
	LEFT JOIN attribute_values av on av.id = pvav.attribute_value_id
	LEFT JOIN public.attributes attr on attr.id = av.attribute_id
ORDER BY
    ch."order",
    product_order ASC,
    ch.path;