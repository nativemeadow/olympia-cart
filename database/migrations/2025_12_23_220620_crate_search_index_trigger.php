<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $driver = DB::connection()->getDriverName();

        if ($driver === 'mysql' || $driver === 'mariadb') {
            // MySQL/MariaDB version with Stored Procedure
            DB::unprepared('
                CREATE PROCEDURE update_variant_description(IN variant_id INT)
                BEGIN
                    DECLARE new_description TEXT;
                    SELECT GROUP_CONCAT(av.value SEPARATOR ", ")
                    INTO new_description
                    FROM attribute_value_product_variant avpv
                    JOIN attribute_values av ON avpv.attribute_value_id = av.id
                    WHERE avpv.product_variant_id = variant_id;

                    UPDATE product_variants
                    SET description = new_description
                    WHERE id = variant_id;
                END
            ');

            DB::unprepared('CREATE TRIGGER after_variant_attribute_insert AFTER INSERT ON attribute_value_product_variant FOR EACH ROW BEGIN CALL update_variant_description(NEW.product_variant_id); END');
            DB::unprepared('CREATE TRIGGER after_variant_attribute_update AFTER UPDATE ON attribute_value_product_variant FOR EACH ROW BEGIN CALL update_variant_description(OLD.product_variant_id); CALL update_variant_description(NEW.product_variant_id); END');
            DB::unprepared('CREATE TRIGGER after_variant_attribute_delete AFTER DELETE ON attribute_value_product_variant FOR EACH ROW BEGIN CALL update_variant_description(OLD.product_variant_id); END');

        } elseif ($driver === 'pgsql') {
            // PostgreSQL version with a Trigger Function
            DB::unprepared('
                CREATE OR REPLACE FUNCTION update_variant_description_trigger()
                RETURNS TRIGGER AS $$
                DECLARE
                    variant_id_to_update INT;
                    new_description TEXT;
                BEGIN
                    IF (TG_OP = \'DELETE\') THEN
                        variant_id_to_update := OLD.product_variant_id;
                    ELSE
                        variant_id_to_update := NEW.product_variant_id;
                    END IF;

                    SELECT STRING_AGG(av.value, \', \')
                    INTO new_description
                    FROM attribute_value_product_variant avpv
                    JOIN attribute_values av ON avpv.attribute_value_id = av.id
                    WHERE avpv.product_variant_id = variant_id_to_update;

                    UPDATE product_variants
                    SET description = new_description
                    WHERE id = variant_id_to_update;

                    IF (TG_OP = \'UPDATE\' AND OLD.product_variant_id IS DISTINCT FROM NEW.product_variant_id) THEN
                        SELECT STRING_AGG(av.value, \', \')
                        INTO new_description
                        FROM attribute_value_product_variant avpv
                        JOIN attribute_values av ON avpv.attribute_value_id = av.id
                        WHERE avpv.product_variant_id = OLD.product_variant_id;

                        UPDATE product_variants
                        SET description = new_description
                        WHERE id = OLD.product_variant_id;
                    END IF;

                    RETURN NULL;
                END;
                $$ LANGUAGE plpgsql;
            ');

            DB::unprepared('CREATE TRIGGER after_variant_attribute_actions AFTER INSERT OR UPDATE OR DELETE ON attribute_value_product_variant FOR EACH ROW EXECUTE FUNCTION update_variant_description_trigger();');

        } elseif ($driver === 'sqlite') {
            // SQLite version - logic is duplicated in each trigger
            DB::unprepared('
                CREATE TRIGGER after_variant_attribute_insert
                AFTER INSERT ON attribute_value_product_variant
                FOR EACH ROW
                BEGIN
                    UPDATE product_variants
                    SET description = (
                        SELECT GROUP_CONCAT(value, ", ")
                        FROM attribute_values
                        WHERE id IN (SELECT attribute_value_id FROM attribute_value_product_variant WHERE product_variant_id = NEW.product_variant_id)
                    )
                    WHERE id = NEW.product_variant_id;
                END;
            ');
            DB::unprepared('
                CREATE TRIGGER after_variant_attribute_update
                AFTER UPDATE ON attribute_value_product_variant
                FOR EACH ROW
                BEGIN
                    UPDATE product_variants
                    SET description = (
                        SELECT GROUP_CONCAT(value, ", ")
                        FROM attribute_values
                        WHERE id IN (SELECT attribute_value_id FROM attribute_value_product_variant WHERE product_variant_id = NEW.product_variant_id)
                    )
                    WHERE id = NEW.product_variant_id;
                END;
            ');
            DB::unprepared('
                CREATE TRIGGER after_variant_attribute_delete
                AFTER DELETE ON attribute_value_product_variant
                FOR EACH ROW
                BEGIN
                    UPDATE product_variants
                    SET description = (
                        SELECT GROUP_CONCAT(value, ", ")
                        FROM attribute_values
                        WHERE id IN (SELECT attribute_value_id FROM attribute_value_product_variant WHERE product_variant_id = OLD.product_variant_id)
                    )
                    WHERE id = OLD.product_variant_id;
                END;
            ');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $driver = DB::connection()->getDriverName();

        if ($driver === 'mysql' || $driver === 'mariadb') {
            DB::unprepared('DROP TRIGGER IF EXISTS after_variant_attribute_insert');
            DB::unprepared('DROP TRIGGER IF EXISTS after_variant_attribute_update');
            DB::unprepared('DROP TRIGGER IF EXISTS after_variant_attribute_delete');
            DB::unprepared('DROP PROCEDURE IF EXISTS update_variant_description');
        } elseif ($driver === 'pgsql') {
            DB::unprepared('DROP TRIGGER IF EXISTS after_variant_attribute_actions ON attribute_value_product_variant');
            DB::unprepared('DROP FUNCTION IF EXISTS update_variant_description_trigger()');
        } elseif ($driver === 'sqlite') {
            DB::unprepared('DROP TRIGGER IF EXISTS after_variant_attribute_insert');
            DB::unprepared('DROP TRIGGER IF EXISTS after_variant_attribute_update');
            DB::unprepared('DROP TRIGGER IF EXISTS after_variant_attribute_delete');
        }
    }
};
