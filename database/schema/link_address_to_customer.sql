-- link fk from addresses to customer where users have addresses
UPDATE addresses as a
SET
    customer_id = (
        SELECT
            c.id
        FROM
            customers as c
        WHERE
            c.user_id = a.user_id
    )
WHERE
    EXISTS (
        SELECT
            1
        FROM
            customers as c
        WHERE
            c.user_id = a.user_id
    );