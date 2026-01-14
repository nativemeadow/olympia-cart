WITH RECURSIVE
    category_hierarchy (id, title, slug, parent_id, "order", level, path) AS (
        -- 1. Base Case: Find root categories (where parent_id is NULL in the join table)
        SELECT
            c.id,
            c.title,
            c.slug,
            cc.parent_id, -- This will be NULL
            cc."order",
            0 AS level,
            c.title AS path
        FROM
            categories c
            JOIN category_category cc ON c.id = cc.child_id
        WHERE
            cc.parent_id IS NULL
        UNION ALL
        -- 2. Recursive Step: Join children to their parents
        SELECT
            child.id,
            child.title,
            child.slug,
            parent_hierarchy.id AS parent_id,
            cc."order",
            parent_hierarchy.level + 1,
            parent_hierarchy.path || ' > ' || child.title
        FROM
            categories AS child
            JOIN category_category AS cc ON child.id = cc.child_id
            JOIN category_hierarchy AS parent_hierarchy ON cc.parent_id = parent_hierarchy.id
    )
    -- 3. Final Selection
SELECT
    *
FROM
    category_hierarchy
ORDER BY
    "order",
    path;