-- update the fk from customer from the users table to the carts table
UPDATE carts as ca
SET
    customer_id = (
        SELECT
            c.id
        FROM
            customers as c
        WHERE
            c.user_id = (
                SELECT
                    u.id
                FROM
                    users as u
                WHERE
                    u.id = ca.user_id
            )
    )
WHERE
    EXISTS (
        SELECT
            1
        FROM
            customers as c
        WHERE
            c.user_id = (
                SELECT
                    u.id
                FROM
                    users as u
                WHERE
                    u.id = ca.user_id
            )
    );