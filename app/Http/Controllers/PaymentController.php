<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Payment;
use App\Models\Checkout;
use App\Services\PaymentGatewayService;
use App\Mail\PaymentConfirmationMail;

use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use App\Constants\StatusCode;

class PaymentController extends Controller
{
    /**
     * Process the payment for a given order.
     *
     * @param Request $request
     * @return \Illuminate\Http\RedirectResponse|\Inertia\Response
     */
    public function store(Request $request, PaymentGatewayService $paymentGateway)
    {
        $orderStatus = StatusCode::getOrderStatus();
        $paymentStatus = StatusCode::getPaymentStatus();
        $checkoutStatus = StatusCode::getCheckoutStatus();
        $cartStatus = StatusCode::getCartStatus();

        $request->validate([
            'checkout_id' => 'required|exists:checkouts,id',
            'payment_method' => 'required|string',
            'card_number' => 'required_if:payment_method,credit_card|string',
            'expiry_date' => 'required_if:payment_method,credit_card|string',
            'card_holder_name' => 'required_if:payment_method,credit_card|string',
            'cvv' => 'required_if:payment_method,credit_card|string',
            // Add other validation rules for card details if payment_method is 'credit_card'
        ]);

        $checkout = Checkout::findOrFail($request->checkout_id);
        $order = Order::where('checkout_id', $checkout->id)->firstOrFail();

        // Ensure the order is in a state that allows payment.
        if ($order->status !== $orderStatus['PENDING']) {
            return back()->withErrors(['error' => 'This order is not awaiting payment.']);
        }

        $cart = $checkout->cart;
        $payment = null;

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
                'checkout_id' => $checkout->id,
                'amount' => $order->total,
                'payment_method' => $request->payment_method,
                'currency' => 'USD',
                'status' => $paymentStatus['PAID'],
                'payment_gateway' => 'SimulatedGateway',
                'gateway_transaction_id' => $transaction->id, // From payment gateway response
                'payment_method_details' => $request->except(['checkout_id', 'payment_method'])
            ]);

            // 3. Update the Order status
            $order->status = $orderStatus['COMPLETED'];
            $order->save();

            $cart->status = $cartStatus['COMPLETED'];
            // Disassociate the session from the completed cart 
            $cart->session_id = null;
            $cart->save();

            $checkout->status = $checkoutStatus['COMPLETED'];
            $checkout->save();

            DB::commit();

            // After successful payment, regenerate the session ID
            $request->session()->regenerate();

            // success email to customer
            $this->sendConfirmationEmail($order, $payment);

            return back()->with('success', 'Payment successful.');
        } catch (Exception $e) {
            DB::rollBack();
            $message = $e->getMessage();
            error_log('Payment processing failed: ' . $message);
            return back()->withErrors(['error' => 'Payment failed. Please try again.']);
        }
    }

    public function sendConfirmationEmail(Order $order, Payment $payment)
    {
        $customer = $order->customer;
        $customer_name = $customer->first_name . ' ' . $customer->last_name;
        $mailData = [
            'orderId' => $order->id,
            'amount' => $payment->amount,
            'date' => $payment->created_at->toFormattedDateString(),
        ];
        try {
            Mail::to($customer->email)->send(new PaymentConfirmationMail(
                orderNumber: $mailData['orderId'],
                amount: $mailData['amount'],
                date: $mailData['date'],
                name: $customer_name
            ));
        } catch (\Exception $e) {
            Log::error("Failed to send payment confirmation email: " . $e->getMessage());
        }
    }
}
