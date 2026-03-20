SELECT
    prods.id AS product_id,
    prods.title AS product_title,
    prods.slug,
    pv.id AS variant_id,
    pv.sku,
    attr.name AS attribute_name,
    attrv.value AS attribute_value
FROM
    products AS prods
JOIN
    product_variants AS pv ON pv.product_id = prods.id
JOIN
    attribute_value_product_variant AS avpv ON avpv.product_variant_id = pv.id
JOIN
    attribute_values AS attrv ON attrv.id = avpv.attribute_value_id
JOIN
    attributes AS attr ON attr.id = attrv.attribute_id
WHERE
    prods.slug = 'test-test';