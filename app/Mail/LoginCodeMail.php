<?php
// app/Mail/LoginCodeMail.php
namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class LoginCodeMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public string $code) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Your Login Code',
        );
    }

    public function content(): Content
    {
        // For a richer email, you can create a full Blade view
        return new Content(
            text: 'Your one-time login code is: ' . $this->code,
        );
    }
}
