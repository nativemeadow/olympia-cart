UPDATE category_category AS cc
SET slug = (STRING_TO_ARRAY(c.slug, '/'))[array_upper(STRING_TO_ARRAY(c.slug, '/'), 1)]
FROM categories AS c
WHERE c.id = cc.child_id;