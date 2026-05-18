-- 1. Create a single, reusable function for all search_index syncing
CREATE OR REPLACE FUNCTION sync_search_index()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        INSERT INTO search_index (title, description, source_table, source_id)
        VALUES (NEW.title, NEW.description, TG_TABLE_NAME, NEW.id);
        RETURN NEW;
        
    ELSIF (TG_OP = 'UPDATE') THEN
        UPDATE search_index
        SET title = NEW.title,
            description = NEW.description
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

-- 2. Bind this single function to all your tables for all events
CREATE TRIGGER products_search_sync
AFTER INSERT OR UPDATE OR DELETE ON products
FOR EACH ROW EXECUTE FUNCTION sync_search_index();

CREATE TRIGGER prices_search_sync
AFTER INSERT OR UPDATE OR DELETE ON prices
FOR EACH ROW EXECUTE FUNCTION sync_search_index();

CREATE TRIGGER categories_search_sync
AFTER INSERT OR UPDATE OR DELETE ON categories
FOR EACH ROW EXECUTE FUNCTION sync_search_index();
