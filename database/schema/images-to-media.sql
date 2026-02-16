insert into
    media (
        title,
        description,
        alt_text,
        file_path,
        file_name,
        mime_type,
        size,
        disk,
        type,
        created_at,
        updated_at
    )
select
    name as title,
    description,
    name as alt_text,
    '' as file_path,
    name as file_name,
    -- Determine the MIME type based on the file extension.
    CASE
        WHEN lower(image) LIKE '%.jpg' THEN 'image/jpeg'
        WHEN lower(image) LIKE '%.jpeg' THEN 'image/jpeg'
        WHEN lower(image) LIKE '%.png' THEN 'image/png'
        WHEN lower(image) LIKE '%.gif' THEN 'image/gif'
        WHEN lower(image) LIKE '%.webp' THEN 'image/webp'
        WHEN lower(image) LIKE '%.pdf' THEN 'application/pdf'
        ELSE 'application/octet-stream' -- A generic default
    END AS mime_type,
    0 as size,
    'public' as disk,
    category as type,
    created_at,
    updated_at
from
    images;