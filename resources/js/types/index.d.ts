import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';
import { Cart, User } from './model-types';

type FlashData = {
    success?: string;
};

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    //auth: Auth;
    auth: {
        user: User | null;
    };
    flash: {
        success?: string;
    };
    cart: Cart | null;
    ziggy: Config & { location: string };
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    avatar?: string | null;
    email_verified_at?: string | null;
    is_guest: boolean;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

import type { Address } from './';

export type Checkout = {
    id: number;
    cart_id: number;
    is_pickup: boolean;
    is_delivery: boolean;
    pickup_date: string | null;
    pickup_time: string | null;
    billing_same_as_shipping: boolean;
    delivery_date: string | null;
    delivery_time: string | null;
    delivery_address_id: number | null;
    delivery_address: Address | null;
    billing_address_id: number | null;
    billing_address: Address | null;
    instructions: string | null;
};

// Type for an attribute (e.g., "Color", "Size")
export type AttributeType = {
    id: number;
    name: string;
    // Add other attribute properties if they exist
};

// Type for an attribute value (e.g., "Red", "Large")
export type AttributeValueType = {
    id: number;
    value: string;
    attribute: AttributeType;
    // Add other attribute value properties if they exist
};

export type VariantType = {
    id: number;
    sku: string;
    price: number;
    attributeValues: AttributeValueType[];
    // Add other variant properties if they exist
};

export type PriceVariantType = {
    id: number;
    sku: string;
    price: number;
    [key: string]: string | number | null; // Allows for dynamic properties like 'unit', 'size', etc.
};

// Type for a product
export type ProductType = {
    id: number;
    title: string;
    slug: string;
    sku: string;
    description?: string | null;
    image?: string | null;
    status: boolean;
    prices: PriceVariantType[];
    // Add other product properties if they exist
};

// Type for the main category data, allowing for recursive children
export type CategoryDataType = {
    id: number;
    title: string;
    slug: string;
    image: string | null;
    description: string | null;
    children: CategoryDataType[];
    children?: Category[];
    products: ProductType[];
    // Add other category properties if they exist
};

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
    };
    flash: {
        success: string | null;
        error: string | null;
    };
};

export type CategoryHierarchy = {
    id: number;
    title: string;
    slug: string;
    parent_id: number | null;
    order: number;
    level: number;
    path: string;
    children?: CategoryHierarchy[];
    products?: Product[];
};
