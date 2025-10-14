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