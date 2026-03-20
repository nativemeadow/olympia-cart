-- CREATE VIRTUAL TABLE search_index USING fts5 (
--    title, -- The title from Categories, Products, or Prices
--    description, -- The description text
--    source_table UNINDEXED, -- Name of the source table ('categories', 'products', 'prices')
--    source_id UNINDEXED, -- The ID of the row in the source table
--    tokenize = 'porter unicode61' -- Optional: A good tokenizer for stemming
--);
-- Since the base 'search_index' table is already migrated to PostgreSQL,
-- we add a Generated 'tsvector' column to handle the tokenization and stemming.
-- The 'english' dictionary handles the Porter stemming algorithm.
ALTER TABLE search_index
ADD COLUMN search_vector tsvector GENERATED ALWAYS AS (
    setweight (to_tsvector ('english', coalesce(title, '')), 'A') || setweight (
        to_tsvector ('english', coalesce(description, '')),
        'B'
    )
) STORED;

-- Create a GIN index on the new tsvector column for fast full-text searching
CREATE INDEX search_index_gin_idx ON search_index USING GIN (search_vector);