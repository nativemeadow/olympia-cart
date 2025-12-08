<?php

namespace Tests\Feature\Mail;

use App\Mail\LoginCodeMail;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class SendRealLoginCodeMailTest extends TestCase
{
    /**
     * A test to send a real login code email to the local mail server.
     *
     * @return void
     */
    public function test_it_sends_a_real_login_code_email(): void
    {
        // 1. Arrange: Define the recipient and the login code.
        $email = 'login-test@example.com';
        $code = random_int(100000, 999999);

        // 2. Act: Send the email through the actual configured mailer.
        // We DO NOT use Mail::fake() here.
        Mail::to($email)->send(new LoginCodeMail((string) $code));

        // 3. Assert: The test passes if no exceptions were thrown.
        // The real verification is done by you in the Mailpit web interface.
        $this->assertTrue(true, "Login code email sent. Check your Herd/Mailpit web interface.");
    }
}
