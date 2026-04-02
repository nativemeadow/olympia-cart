select cc.* 
from category_category as cc
where cc.slug @> ANY(STRING_TO_ARRAY('sand-gravel-aggregates/sand', '/')); 