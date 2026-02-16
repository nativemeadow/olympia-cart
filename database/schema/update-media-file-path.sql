update media
set
    file_path = (
        case
            WHEN type = 'products' THEN CONCAT ('products/', file_path)
            WHEN type = 'product-categories' THEN CONCAT ('category_images/', file_path)
            WHEN type = 'faq' THEN CONCAT ('faqs/', file_path)
            else file_path
        end
    );