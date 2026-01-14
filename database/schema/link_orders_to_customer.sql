-- update the fk from customer to orders table
UPDATE orders as o
SET
    customer_id = (
        SELECT
            c.id
        FROM
            customers as c
        WHERE
            c.user_id = o.user_id
    )
WHERE
    EXISTS (
        SELECT
            1
        FROM
            customers as c
        WHERE
            c.user_id = o.user_id
    );