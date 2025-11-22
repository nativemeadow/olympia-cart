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

    public static function getCartStatus()
    {
        $statusCodes = env('CART_STATUS');
        if ($statusCodes) {
            return json_decode($statusCodes, true);
        }
        return self::CART_STATUS;
    }

    public static function getOrderStatus()
    {
        $statusCodes = env('ORDER_STATUS');
        if ($statusCodes) {
            return json_decode($statusCodes, true);
        }
        return self::ORDER_STATUS;
    }

    public static function getPaymentStatus()
    {
        $statusCodes = env('PAYMENT_STATUS');
        if ($statusCodes) {
            return json_decode($statusCodes, true);
        }
        return self::PAYMENT_STATUS;
    }

    public static function getProductStatus()
    {
        $statusCodes = env('PRODUCT_STATUS');
        if ($statusCodes) {
            return json_decode($statusCodes, true);
        }
        return self::PRODUCT_STATUS;
    }
}
