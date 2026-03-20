select
    *
from
    products as prods
    JOIN product_variants as pv on product_id = prods.id
    JOIN attribute_value_product_variant as avpv on pv.id = product_variant_id
    JOIN attributes as attr on attr.id = avpv.attribute_value_id
    join attribute_values as attrv on attrv.attribute_id = attr.id
where
    slug = 'test-test'