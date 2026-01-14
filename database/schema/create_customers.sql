--query to take users that have completed orders
-- and create customer records for them
WITH
    completed_orders AS (
        SELECT DISTINCT
            o.user_id,
            u.first_name,
            u.last_name,
            u.email
        FROM
            orders o
            join users u ON o.user_id = u.id
        WHERE
            o.status = 'completed'
    )
INSERT INTO
    customers (
        user_id,
        first_name,
        last_name,
        email,
        created_at,
        updated_at
    )
SELECT
    co.user_id,
    co.first_name,
    co.last_name,
    co.email,
    datetime ('now') AS created_at,
    datetime ('now') AS updated_at
FROM
    completed_orders co
    LEFT JOIN customers c ON co.user_id = c.user_id
WHERE
    c.id IS NULL;

-- only insert if customer record does not already exist