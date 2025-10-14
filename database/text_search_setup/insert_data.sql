-- Populate from the 'categories' table
INSERT INTO
    search_index (title, description, source_table, source_id)
SELECT
    title,
    description,
    'categories',
    id
FROM
    categories;

-- Populate from the 'products' table
INSERT INTO
    search_index (title, description, source_table, source_id)
SELECT
    title,
    description,
    'products',
    id
FROM
    products;

-- Populate from the 'prices' table
INSERT INTO
    search_index (title, description, source_table, source_id)
SELECT
    title,
    description,
    'prices',
    id
FROM
    prices;