update media
set
    file_name = (
        select
            image
        from
            images
        where
            media.title = images.name
    );