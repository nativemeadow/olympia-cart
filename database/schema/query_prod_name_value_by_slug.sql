SELECT attr.id, attr.name, attrv.value 
FROM public.attribute_value_product_variant as avpv
JOIN attribute_values as attrv on attrv.id = avpv.attribute_value_id
JOIN public.attributes as attr on attr.id = attrv.attribute_id
JOIN public.products as p on p.slug = 'red-la-paz-pebbles-special-order'
JOIN public.product_variants as pv on pv.product_id = p.id
where avpv.product_variant_id = pv.id
    and avpv.attribute_value_id = attrv.id
ORDER BY attr.id ASC , product_variant_id ASC  