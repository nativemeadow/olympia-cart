DROP TRIGGER IF EXISTS products_search_sync ON products;
DROP TRIGGER IF EXISTS categories_search_sync ON categories;
DROP TRIGGER IF EXISTS product_variants_search_sync ON product_variants;

-- This file consolidates all triggers required for the search index.
-- It should be the single source of truth for search-related database triggers.

-- 1. Generic sync function for simple tables (products, categories)
-- This function handles syncing tables that have 'title' and 'description' columns.
CREATE OR REPLACE FUNCTION sync_simple_search_index()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        NEW.document := to_tsvector('english', NEW.title || ' ' || NEW.description);
    ELSIF (TG_OP = 'UPDATE') THEN
        NEW.document := to_tsvector('english', NEW.title || ' ' || NEW.description);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Specialized sync function for the 'product_variants' table.
-- This function builds a composite title and description from the variant and its attributes.
CREATE OR REPLACE FUNCTION sync_product_variant_search_index()
RETURNS TRIGGER AS $$
DECLARE
    product_title TEXT;
    attributes_desc TEXT;
BEGIN
    -- Get product title
    SELECT title INTO product_title FROM products WHERE id = NEW.product_id;

    -- Concatenate attribute names and values for the description
    SELECT string_agg(attr.name || ': ' || val.value, ', ')
    INTO attributes_desc
    FROM attribute_value_product_variant avpv
    JOIN attribute_values val ON avpv.attribute_value_id = val.id
    JOIN attributes attr ON val.attribute_id = attr.id
    WHERE avpv.product_variant_id = NEW.id;

    IF (TG_OP = 'INSERT') THEN
        NEW.document := to_tsvector('english', product_title || ' ' || NEW.sku || ' ' || COALESCE(attributes_desc, ''));
    ELSIF (TG_OP = 'UPDATE') THEN
        NEW.document := to_tsvector('english', product_title || ' ' || NEW.sku || ' ' || COALESCE(attributes_desc, ''));
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- 3. Create the triggers using the functions defined above.

-- Trigger for the 'products' table
CREATE TRIGGER products_search_sync
BEFORE INSERT OR UPDATE ON products
FOR EACH ROW EXECUTE FUNCTION sync_simple_search_index();

-- Trigger for the 'categories' table
CREATE TRIGGER categories_search_sync
BEFORE INSERT OR UPDATE ON categories
FOR EACH ROW EXECUTE FUNCTION sync_simple_search_index();

-- Trigger for the 'product_variants' table
CREATE TRIGGER product_variants_search_sync
BEFORE INSERT OR UPDATE ON product_variants
FOR EACH ROW EXECUTE FUNCTION sync_product_variant_search_index();
