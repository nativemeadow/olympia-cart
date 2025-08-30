export type User = {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    email_verified_at?: string | null;
    created_at: string;
    updated_at: string;
};

export type Category = {
    id: number;
    title: string;
    slug: string;
    description?: string | null;
    image?: string | null;
    created_at: string;
    updated_at: string;
    // Relationships
    parents?: Category[];
    children?: Category[];
};

export type Product = {
    id: number;
    uuid: string;
    sku: string;
    title: string;
    slug: string;
    description?: string | null;
    image?: string | null;
    status: boolean;
    created_at: string;
    updated_at: string;
    // Relationships
    prices?: Price[];
    categories?: Category[];
};

export type Price = {
    id: number;
    product_id: number;
    sku?: string | null;
    title?: string | null;
    description?: string | null;
    image?: string | null;
    price: number;
    currency: string;
    unit?: string | null;
    size?: string | null;
    coverage?: string | null;
    coverage_value?: number | null;
    online_minimum?: number | null;
    created_at: string;
    updated_at: string;
    // Relationships
    product?: Product;
};

export type Address = {
    id: number;
    user_id: number;
    street: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    created_at: string;
    updated_at: string;
};

export type Images = {
    id: number;
    product_id?: number | null;
    category_id?: number | null;
    url: string;
    alt?: string | null;
    created_at: string;
    updated_at: string;
};
