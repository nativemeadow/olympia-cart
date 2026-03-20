-- 1. Drop the old prices trigger
-- DROP TRIGGER IF EXISTS prices_search_sync ON prices;

-- 2. Create/replace the sync function for product_variants
CREATE OR REPLACE FUNCTION sync_product_variant_search_index()
RETURNS TRIGGER AS $$
DECLARE
    product_title TEXT;
    attributes_desc TEXT;
BEGIN
    -- Get product title
    SELECT title INTO product_title FROM products WHERE id = NEW.product_id;

    -- Concatenate attribute names and values
    SELECT string_agg(attr.name || ': ' || val.value, ', ')
    INTO attributes_desc
    FROM attribute_value_product_variant avpv
    JOIN attribute_values val ON avpv.attribute_value_id = val.id
    JOIN attributes attr ON val.attribute_id = attr.id
    WHERE avpv.product_variant_id = NEW.id;

    IF (TG_OP = 'INSERT') THEN
        INSERT INTO search_index (title, description, source_table, source_id)
        VALUES (
            product_title || ' - ' || NEW.sku,
            attributes_desc,
            TG_TABLE_NAME,
            NEW.id
        );
        RETURN NEW;

    ELSIF (TG_OP = 'UPDATE') THEN
        UPDATE search_index
        SET title = product_title || ' - ' || NEW.sku,
            description = attributes_desc
        WHERE source_table = TG_TABLE_NAME AND source_id = CAST(NEW.id AS TEXT);
        RETURN NEW;

    ELSIF (TG_OP = 'DELETE') THEN
        DELETE FROM search_index
        WHERE source_table = TG_TABLE_NAME AND source_id = CAST(OLD.id AS TEXT);
        RETURN OLD;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 3. Create the trigger for product_variants
DROP TRIGGER IF EXISTS product_variants_search_sync ON product_variants;

CREATE TRIGGER product_variants_search_sync
AFTER INSERT OR UPDATE OR DELETE ON product_variants
FOR EACH ROW EXECUTE FUNCTION sync_product_variant_search_index();