WITH RECURSIVE
    category_hierarchy (
        id,
        title,
        slug,
        description,
        image,
        is_active,
        created_at,
        updated_at,
        parent_id,
        "order",
        level,
        path,
        media_id,
        media_title,
        media_description,
        media_alt_text,
        media_file_path,
        media_file_name,
        media_mime_type,
        media_size,
        media_disk,
        media_type
    ) AS (
        -- 1. Base Case: Find root categories (where parent_id is NULL in the join table)
        SELECT
            c.id,
            c.title,
            c.slug,
            c.description,
            c.image,
            c.is_active,
            c.created_at,
            c.updated_at,
            cc.parent_id, -- This will be NULL
            cc."order",
            0 AS level,
            c.title AS path,
            m.id AS media_id,
            m.title AS media_title,
            m.description AS media_description,
            m.alt_text AS media_alt_text,
            m.file_path AS media_file_path,
            m.file_name AS media_file_name,
            m.mime_type AS media_mime_type,
            m.size AS media_size,
            m.disk AS media_disk,
            m.type AS media_type
        FROM
            categories c
            JOIN category_category cc ON c.id = cc.child_id
            LEFT JOIN media m ON c.image = m.file_name -- Join media table
        WHERE
            cc.parent_id IS NULL
        UNION ALL
        -- 2. Recursive Step: Join children to their parents
        SELECT
            child.id,
            child.title,
            child.slug,
            child.description,
            child.image,
            child.is_active,
            child.created_at,
            child.updated_at,
            parent_hierarchy.id AS parent_id,
            cc."order",
            parent_hierarchy.level + 1,
            parent_hierarchy.path || ' > ' || child.title,
            m.id AS media_id,
            m.title AS media_title,
            m.description AS media_description,
            m.alt_text AS media_alt_text,
            m.file_path AS media_file_path,
            m.file_name AS media_file_name,
            m.mime_type AS media_mime_type,
            m.size AS media_size,
            m.disk AS media_disk,
            m.type AS media_type
        FROM
            categories AS child
            JOIN category_category AS cc ON child.id = cc.child_id
            JOIN category_hierarchy AS parent_hierarchy ON cc.parent_id = parent_hierarchy.id
            LEFT JOIN media m ON child.image = m.file_name -- Join media table
    )
    -- 3. Final Selection
SELECT
    *
FROM
    category_hierarchy
ORDER BY
    category_hierarchy."order",
    path;