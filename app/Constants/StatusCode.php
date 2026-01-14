<?php

namespace App\Constants;

class StatusCode
{
    const CART_STATUS = [
        'ACTIVE' => 'active',
        'COMPLETED' => 'completed',
        'ABANDONED' => 'abandoned',
    ];

    const PRODUCT_STATUS = [
        'ACTIVE' => 'active',
        'INACTIVE' => 'inactive',
        'DISCONTINUED' => 'discontinued',
    ];

    const ORDER_STATUS = [
        'PENDING' => 'pending',
        'PROCESSING' => 'processing',
        'COMPLETED' => 'completed',
        'CANCELLED' => 'cancelled',
        'REFUNDED' => 'refunded',
    ];

    const PAYMENT_STATUS = [
        'UNPAID' => 'unpaid',
        'PAID' => 'paid',
        'REFUNDED' => 'refunded',
    ];

    const CHECKOUT_STATUS = [
        'PENDING' => 'pending',
        'COMPLETED' => 'completed',
        'CANCELLED' => 'cancelled',
    ];

    public static function getCartStatus()
    {
        return config('status_codes.CART_STATUS', self::CART_STATUS);
    }

    public static function getOrderStatus()
    {
        return config('status_codes.ORDER_STATUS', self::ORDER_STATUS);
    }

    public static function getPaymentStatus()
    {
        return config('status_codes.PAYMENT_STATUS', self::PAYMENT_STATUS);
    }

    public static function getProductStatus()
    {
        return config('status_codes.PRODUCT_STATUS', self::PRODUCT_STATUS);
    }

    public static function getCheckoutStatus()
    {
        return config('status_codes.CHECKOUT_STATUS', self::CHECKOUT_STATUS);
    }
}
