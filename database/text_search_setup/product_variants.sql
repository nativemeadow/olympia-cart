select
    product_id,
    sku,
    price,
    attr."name",
    attrval."value"
from
    product_variants as pv
    join attribute_value_product_variant as avpv on pv.id = avpv.product_variant_id
    join attributes as attr on attr.id = avpv.attribute_value_id
    join attribute_values as attrval on attr.id = attrval.id