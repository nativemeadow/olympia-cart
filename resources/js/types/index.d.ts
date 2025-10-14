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
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

export type Checkout = {
    id: number;
    cart_id: number;
    is_pickup: boolean;
    is_delivery: boolean;
    pickup_date: string | null;
    pickup_time: string | null;
    delivery_date: string | null;
    delivery_time: string | null;
    delivery_address_id: number | null;
    billing_address_id: number | null;
    instructions: string | null;
};
