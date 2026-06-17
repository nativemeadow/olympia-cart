select
    *
from
    products as p
    LEFT JOIN product_variants pv ON p.id = pv.product_id
    LEFT JOIN attribute_value_product_variant as avpv on avpv.product_variant_id = pv.id
    LEFT JOIN attribute_values av on av.id = avpv.attribute_value_id
    LEFT JOIN public.attributes attr on attr.id = av.attribute_id
    LEFT JOIN media_associations ma ON ma.mediable_id = p.id
    LEFT JOIN media m ON ma.media_id = m.id
where
    p.id = 417