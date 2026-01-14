-- update the customer_id fk in checkouts table  from carts from users to checkouts table
UPDATE checkouts as ch
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
                    JOIN carts as ca ON u.id = ca.user_id
                WHERE
                    ca.id = ch.cart_id
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
                    JOIN carts as ca ON u.id = ca.user_id
                WHERE
                    ca.id = ch.cart_id
            )
    );