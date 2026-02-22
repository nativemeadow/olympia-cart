SELECT
    *
from
    (
        SELECT
            file_name,
            COUNT(*) as count,
            GROUP_CONCAT (id) as ids
        FROM
            media
        GROUP BY
            file_name
        HAVING
            count > 1
    ) as duplicates;