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
    allAttributes?: Attributes[],
): Product => {
    const processedVariants = product.variants?.map((variant) => {
        const initial = initialVariant(
            allAttributes && allAttributes.length > 0
                ? allAttributes
                : undefined,
        );
        const newVariant: ProductVariant = {
            ...initial,
            ...JSON.parse(JSON.stringify(variant)), // Deep copy
            extended_properties: {
                ...initial.extended_properties,
                ...variant.extended_properties,
            },
        };

        newVariant.extended_properties = { ...newVariant.extended_properties };

        variant.attributes?.forEach((attr) => {
            const attrName = attr.name;
            const attrValue =
                attr.value === null || attr.value === undefined
                    ? ''
                    : String(attr.value);

            if (attrName === 'Title') {
                newVariant.title = attrValue;
            } else if (attrName === 'Description') {
                newVariant.description = attrValue;
            } else if (attrName === 'Image') {
                // Logic to handle image
            } else if (
                newVariant.extended_properties &&
                !excludeKeys.includes(attrName)
            ) {
                // Populate extended_properties from the new source
                newVariant.extended_properties[attrName] = attr.value;
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
