export const ImageTypeOptions = [
    {
        value: import.meta.env.VITE_CATEGORIES_IMAGE_TYPE ?? 'categories',
        label: 'Categories',
    },
    {
        value: import.meta.env.VITE_PRODUCTS_IMAGE_TYPE ?? 'products',
        label: 'Products',
    },
];
