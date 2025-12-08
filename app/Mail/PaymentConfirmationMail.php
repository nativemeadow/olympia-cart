<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PaymentConfirmationMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $orderNumber,
        public float $amount,
        public string $date
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Your Payment Confirmation for Order ' . $this->orderNumber,
        );
    }

    public function content(): Content
    {
        // For a richer email, you can create a full Blade view
        return new Content(
            view: 'mail.payment-confirmation',
        );
    }
}
