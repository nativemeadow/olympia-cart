-- After a new product is inserted, add it to the search index.
CREATE TRIGGER products_after_insert AFTER INSERT ON products BEGIN
INSERT INTO
    search_index (title, description, source_table, source_id)
VALUES
    (new.title, new.description, 'products', new.id);

END;

-- After a product is deleted, remove it from the search index.
CREATE TRIGGER products_after_delete AFTER DELETE ON products BEGIN
DELETE FROM search_index
WHERE
    source_table = 'products'
    AND source_id = old.id;

END;

-- After a product is updated, update the corresponding entry in the search index.
CREATE TRIGGER products_after_update AFTER
UPDATE ON products BEGIN
UPDATE search_index
SET
    title = new.title,
    description = new.description
WHERE
    source_table = 'products'
    AND source_id = new.id;

END;

/* 
-- After a new product is inserted, add it to the search index.
CREATE TRIGGER prices_after_insert AFTER INSERT ON prices BEGIN
INSERT INTO
search_index (title, description, source_table, source_id)
VALUES
(new.title, new.description, 'prices', new.id);

END;

-- After a product is deleted, remove it from the search index.
CREATE TRIGGER prices_after_delete AFTER DELETE ON prices BEGIN
DELETE FROM search_index
WHERE
source_table = 'prices'
AND source_id = old.id;

END;

-- After a product is updated, update the corresponding entry in the search index.
CREATE TRIGGER prices_after_update AFTER
UPDATE ON prices BEGIN
UPDATE search_index
SET
title = new.title,
description = new.description
WHERE
source_table = 'prices'
AND source_id = new.id;

END; */
-- ... existing triggers for 'products' and 'categories' ...
-- =================================================================
-- REMOVE: Old triggers for the 'prices' table are now obsolete.
-- =================================================================
DROP TRIGGER IF EXISTS prices_after_insert;

DROP TRIGGER IF EXISTS prices_after_delete;

DROP TRIGGER IF EXISTS prices_after_update;

-- =================================================================
-- NEW: Triggers to replace the old 'prices' triggers.
-- These manage the search index for product variants.
-- =================================================================
-- 1. Trigger to create a placeholder entry when a new variant is created.
CREATE TRIGGER IF NOT EXISTS variants_after_insert AFTER INSERT ON product_variants BEGIN
-- Insert a new row for the variant. Title and description will be filled in
-- by the attribute triggers below.
INSERT INTO
    search_index (source_table, source_id, title, description)
VALUES
    ('variants', NEW.id, '', '');

END;

-- 2. Trigger to remove the entry when a variant is deleted.
CREATE TRIGGER IF NOT EXISTS variants_after_delete AFTER DELETE ON product_variants BEGIN
DELETE FROM search_index
WHERE
    source_table = 'variants'
    AND source_id = OLD.id;

END;

-- 3. Trigger to update the search index when an attribute is linked to a variant.
CREATE TRIGGER IF NOT EXISTS variant_attributes_after_insert AFTER INSERT ON attribute_value_product_variant FOR EACH ROW BEGIN
-- Update the 'title' column if a 'title' attribute was just added.
UPDATE search_index
SET
    title = (
        SELECT
            value
        FROM
            attribute_values
        WHERE
            id = NEW.attribute_value_id
    )
WHERE
    source_table = 'variants'
    AND source_id = NEW.product_variant_id
    AND (
        SELECT
            name
        FROM
            attributes
        WHERE
            id = (
                SELECT
                    attribute_id
                FROM
                    attribute_values
                WHERE
                    id = NEW.attribute_value_id
            )
    ) = 'title';

-- Update the 'description' column if a 'description' attribute was just added.
UPDATE search_index
SET
    description = (
        SELECT
            value
        FROM
            attribute_values
        WHERE
            id = NEW.attribute_value_id
    )
WHERE
    source_table = 'variants'
    AND source_id = NEW.product_variant_id
    AND (
        SELECT
            name
        FROM
            attributes
        WHERE
            id = (
                SELECT
                    attribute_id
                FROM
                    attribute_values
                WHERE
                    id = NEW.attribute_value_id
            )
    ) = 'description';

END;

-- 4. Trigger to clear fields in the search index when an attribute is unlinked.
CREATE TRIGGER IF NOT EXISTS variant_attributes_after_delete AFTER DELETE ON attribute_value_product_variant FOR EACH ROW BEGIN
-- Clear the 'title' if a 'title' attribute was removed.
UPDATE search_index
SET
    title = ''
WHERE
    source_table = 'variants'
    AND source_id = OLD.product_variant_id
    AND (
        SELECT
            name
        FROM
            attributes
        WHERE
            id = (
                SELECT
                    attribute_id
                FROM
                    attribute_values
                WHERE
                    id = OLD.attribute_value_id
            )
    ) = 'title';

-- Clear the 'description' if a 'description' attribute was removed.
UPDATE search_index
SET
    description = ''
WHERE
    source_table = 'variants'
    AND source_id = OLD.product_variant_id
    AND (
        SELECT
            name
        FROM
            attributes
        WHERE
            id = (
                SELECT
                    attribute_id
                FROM
                    attribute_values
                WHERE
                    id = OLD.attribute_value_id
            )
    ) = 'description';

END;

-- After a new product is inserted, add it to the search index.
CREATE TRIGGER categories_after_insert AFTER INSERT ON categories BEGIN
INSERT INTO
    search_index (title, description, source_table, source_id)
VALUES
    (new.title, new.description, 'categories', new.id);

END;

-- After a product is deleted, remove it from the search index.
CREATE TRIGGER categories_after_delete AFTER DELETE ON categories BEGIN
DELETE FROM search_index
WHERE
    source_table = 'categories'
    AND source_id = old.id;

END;

-- After a product is updated, update the corresponding entry in the search index.
CREATE TRIGGER categories_after_update AFTER
UPDATE ON categories BEGIN
UPDATE search_index
SET
    title = new.title,
    description = new.description
WHERE
    source_table = 'categories'
    AND source_id = new.id;

END;