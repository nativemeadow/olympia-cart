<?php

use App\Mail\PaymentConfirmationMail;
use App\Models\User;
use Illuminate\Support\Facades\Mail;

test('it sends a real payment confirmation email to the local mail server', function () {
    // 1. Arrange: Create the data for the email.
    // Ensure your .env is configured for Herd (e.g., MAIL_PORT=2525).
    $user = new User([
        'email' => 'test-customer@example.com',
        'name' => 'John Doe',
    ]);

    $orderNumber = 'ORD-REAL-TEST-001';
    $amount = 99.50;
    $date = now()->toFormattedDateString();

    // 2. Act: Send the email through the actual configured mailer.
    // We DO NOT use Mail::fake() here.
    Mail::to($user)->send(new PaymentConfirmationMail($orderNumber, $amount, $date));

    // 3. Assert: The test passes if no exceptions were thrown during sending.
    // The real verification is manual.
    $this->assertTrue(true, "Email sent. Check your Herd/Mailpit web interface to verify.");
});
