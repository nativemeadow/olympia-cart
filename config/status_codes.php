<?php

use Illuminate\Support\Facades\Config;

return [
    'CART_STATUS' => config('CART_STATUS', [
        'ACTIVE' => 'active',
        'COMPLETED' => 'completed',
        'ABANDONED' => 'abandoned',
    ]),
    'PRODUCT_STATUS' => config('PRODUCT_STATUS', [
        'ACTIVE' => 'active',
        'INACTIVE' => 'inactive',
        'DISCONTINUED' => 'discontinued',
    ]),
    'ORDER_STATUS' => config('ORDER_STATUS', [
        'PENDING' => 'pending',
        'PROCESSING' => 'processing',
        'COMPLETED' => 'completed',
        'CANCELLED' => 'cancelled',
        'REFUNDED' => 'refunded',
    ]),
    'PAYMENT_STATUS' => config('PAYMENT_STATUS', [
        'UNPAID' => 'unpaid',
        'PAID' => 'paid',
        'REFUNDED' => 'refunded',
    ]),
    'CHECKOUT_STATUS' => config('CHECKOUT_STATUS', [
        'PENDING' => 'pending',
        'COMPLETED' => 'completed',
        'CANCELLED' => 'cancelled',
    ]),
];
