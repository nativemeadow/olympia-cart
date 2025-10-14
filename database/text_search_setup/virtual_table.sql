CREATE VIRTUAL TABLE search_index USING fts5 (
    title, -- The title from Categories, Products, or Prices
    description, -- The description text
    source_table UNINDEXED, -- Name of the source table ('categories', 'products', 'prices')
    source_id UNINDEXED, -- The ID of the row in the source table
    tokenize = 'porter unicode61' -- Optional: A good tokenizer for stemming
);