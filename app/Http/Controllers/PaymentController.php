<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Payment;
use App\Services\PaymentGatewayService;

use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;


class PaymentController extends Controller
{
    /**
     * Process the payment for a given order.
     *
     * @param Request $request
     * @return \Illuminate\Http\RedirectResponse|\Inertia\Response
     */
    public function process(Request $request, PaymentGatewayService $paymentGateway)
    {
        $request->validate([
            'order_id' => 'required|exists:orders,id',
            'payment_method' => 'required|string',
            // Add other validation rules for card details if payment_method is 'credit_card'
        ]);

        $order = Order::findOrFail($request->order_id);

        // Ensure the order is in a state that allows payment.
        if ($order->status !== 'pending_payment') {
            return back()->withErrors(['error' => 'This order is not awaiting payment.']);
        }

        DB::beginTransaction();

        try {
            // 1. Process payment through a gateway
            $transaction = $paymentGateway->charge(
                $order->total,
                $request->payment_method,
                $request->all() // Pass card details, etc.
            );

            // 2. Create a Payment record
            $payment = Payment::create([
                'order_id' => $order->id,
                'amount' => $order->total,
                'payment_method' => $request->payment_method,
                'status' => 'completed',
                'transaction_id' => $transaction->id, // From payment gateway response
            ]);

            // 3. Update the Order status
            $order->status = 'processing'; // Or 'completed'
            $order->save();

            DB::commit();

            // 4. Redirect to confirmation page on success
            return Inertia::render('CheckoutCart/StepFive/Page', [
                'order' => $order->fresh(), // Pass fresh order data to the confirmation page
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            // Log the exception $e->getMessage()
            return back()->withErrors(['error' => 'Payment failed. Please try again.']);
        }
    }
}
