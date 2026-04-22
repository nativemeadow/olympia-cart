import { User as UserType } from '@/types/model-types';
import { Checkout } from '.';

export type User = {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    email_verified_at?: string | null;
    avatar?: string | null;
    is_guest: boolean;
    created_at: string;
    updated_at: string;
};

export type Customer = {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string | null;
    active: boolean;
    company?: string | null;
    created_at: string;
    updated_at: string;
    user_id?: number | null;
    addresses?: Address[];
    orders?: Order[];
    carts?: Cart[];
};

export type Category = {
    id: number;
    title: string;
    slug: string;
    description?: string | null;
    image?: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    // Relationships
    breadcrumb?: string;
    parents?: Category[];
    children?: Category[];
    products?: Product[];
    media?: Media;
};

export type Categories = Array<{
    id: number;
    title: string;
    slug: string;
    description: string;
    image: string;
}>;

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
    media?: Media[];
};

export type Price = {
    id: number;
    product_id: number;
    sku?: string | null;
    price: number;
    extended_properties?: ExtendedProps;
    product?: Product;
    title?: string | null;
    description?: string | null;
    image?: Media | null;
    attribute_values?: AttributeValue[];
};

export type Attributes = {
    id: number;
    name: string;
    data_type: string;
    list_of_values?: JSON | null;
    created_at: string;
    updated_at: string;
};

export type AttributeValue = {
    id: number;
    attribute_id: number;
    value: string;
    created_at: string;
    updated_at: string;
    attribute?: Attributes;
};

export type ExtendedProps = {
    [key: string]: string | number | boolean | null | undefined;
};

export type Address = {
    id: number;
    name: string;
    customer_id: number;
    street1: string;
    street2?: string | null;
    city: string;
    state: string;
    zip: string;
    default: boolean;
    billing: boolean;
    phone?: string | null;
    country: string;
    created_at: string;
    updated_at: string;
};

export type Images = {
    id: number;
    name: string;
    image: string;
    description?: string | null;
    category: string;
    created_at: string;
    updated_at: string;
};

export type Media = {
    id: number;
    title: string;
    description?: string | null;
    alt_text?: string | null;
    file_path: string;
    file_name: string;
    url: string; // This will be added dynamically in the controller
    mime_type: string;
    size: number;
    disk: string;
    type?: string | null; // e.g., 'product', 'category', 'faq'
    created_at: string;
    updated_at: string;
};

export type CartItem = {
    id?: number | undefined;
    product_id: number | undefined;
    category_slug?: string | undefined;
    product_slug?: string | undefined;
    cart_id?: number | undefined;
    item_id?: number | undefined;
    sku: string | undefined;
    title: string | undefined;
    image: string | undefined;
    price: number;
    quantity: number;
    unit: string | undefined;
    color?: string | undefined;
};

export type Cart = {
    id: number;
    user_id: number;
    cart_uuid: string;
    session_id: string;
    status: string;
    active: boolean;
    total: number;
    created_at: string;
    updated_at: string;
    category_slug?: string | undefined;
    product_slug?: string | undefined;
    // Relationships
    items?: CartItem[];
    checkout?: Checkout | null;
};

export type Order = {
    id: number;
    user_id?: number | null;
    user: UserType | null;
    customer?: Customer | null;
    guest_name: string;
    guest_email: string;
    status: string;
    total: number;
    created_at: string;
    updated_at: string;
    // Relationships
    items?: OrderItem[];
    billing_address?: Address;
    shipping_address?: Address;
    checkout?: Checkout | null;
};

export type OrderItem = {
    id: number;
    product_id: number;
    product: Product;
    order_id: number;
    category_slug: string;
    product_slug: string;
    sku: string;
    title: string;
    image: string;
    price: number;
    quantity: number;
    unit: string;
    created_at: string;
    updated_at: string;
};

export type CustomerData = (Customer & { addresses: Address[] }) | null;
