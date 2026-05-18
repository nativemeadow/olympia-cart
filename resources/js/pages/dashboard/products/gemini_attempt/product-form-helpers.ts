import {
    Product,
    ProductVariant,
    Attributes,
    ExtendedProps,
    Category,
} from '@/types/model-types';
import { CategoryHierarchy } from '@/types';

export const initialProduct = (): Product => ({
    id: 0,
    uuid: '',
    title: '',
    sku: '',
    slug: '',
    description: '',
    image: '',
    status: true,
    categories: [],
    variants: [],
    media: [],
    created_at: '',
    updated_at: '',
});

export const excludeKeys = ['Title', 'Description', 'Image'];

export const initialVariant = (attributes?: Attributes[]): ProductVariant => {
    const extended_properties: ExtendedProps = {};
    if (attributes) {
        attributes.forEach((attr) => {
            extended_properties[attr.name] = '';
        });
    }
    const defaultExtendedProps = {
        id: Date.now(), // Temporary unique ID
        product_id: 0,
        sku: '',
        price: 0,
        title: '',
        description: '',
        image: null,
        extended_properties: extended_properties,
    };
    return defaultExtendedProps;
};

export const PrepareProductData = (
    product: Product,
    attributes?: Attributes[],
): Product => {
    const processedVariants = product.variants?.map((variant) => {
        const initial = initialVariant(attributes);
        const newVariant: ProductVariant = {
            ...initial,
            ...variant,
            extended_properties: {
                ...initial.extended_properties,
                ...variant.extended_properties,
            },
        };

        newVariant.extended_properties = { ...newVariant.extended_properties };

        variant.new_attribute_values?.forEach((attrValue) => {
            if (attrValue.attribute) {
                const attrName = attrValue.attribute.name;
                if (attrName === 'Title') {
                    newVariant.title = attrValue.value;
                } else if (attrName === 'Description') {
                    newVariant.description = attrValue.value;
                } else if (attrName === 'Image') {
                    // This assumes the value is a path that can be resolved to a media object
                    // This part might need more complex logic if you need to fetch the full Media object
                } else if (
                    newVariant.extended_properties &&
                    !excludeKeys.includes(attrName)
                ) {
                    newVariant.extended_properties[attrName] = attrValue.value;
                }
            }
        });
        return newVariant;
    });

    return {
        ...product,
        variants: processedVariants,
    };
};

export const findCategory = (
    categories: CategoryHierarchy[],
    id: number,
): Category | undefined => {
    for (const category of categories) {
        if (category.id === id) {
            return category as Category;
        }
        if (category.children) {
            const found = findCategory(category.children, id);
            if (found) return found;
        }
    }
};
