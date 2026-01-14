-- update payments fk from checkouts from carts from users to payments table
UPDATE payments as p
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
                    JOIN checkouts as ch ON ca.id = ch.cart_id
                WHERE
                    ch.id = p.checkout_id
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
                    JOIN checkouts as ch ON ca.id = ch.cart_id
                WHERE
                    ch.id = p.checkout_id
            )
    );