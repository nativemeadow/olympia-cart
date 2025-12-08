<?php

namespace App\Services;

use Exception;
use stdClass;

class PaymentGatewayService
{
    /**
     * Simulate charging a payment method.
     *
     * @param float $amount
     * @param string $paymentMethod
     * @param array $details
     * @return object
     * @throws Exception
     */
    public function charge(float $amount, string $paymentMethod, array $details): object
    {
        // Simulate different payment method behaviors
        switch ($paymentMethod) {
            case 'credit_card':
                // In a real app, you'd integrate with a service like Stripe.
                // This simulates a successful charge.
                if (empty($details['card_number']) || empty($details['expiry_date']) || empty($details['cvv'])) {
                    throw new Exception('Credit card details are incomplete.');
                }

                $transaction = new stdClass();
                $transaction->id = 'txn_' . uniqid();
                return $transaction;

            case 'paypal':
            case 'cash_on_delivery':
                // For PayPal or Cash on Delivery, we can simulate a transaction ID
                // without external processing at this stage.
                $transaction = new stdClass();
                $transaction->id = substr($paymentMethod, 0, 2) . '_' . uniqid();
                return $transaction;

            default:
                throw new Exception('Unsupported payment method.');
        }
    }
}
