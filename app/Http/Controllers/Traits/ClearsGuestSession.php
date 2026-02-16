<?php

namespace App\Http\Controllers\Traits;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

trait ClearsGuestSession
{
    /**
     * If a guest_customer_id exists in the session, remove it.
     * This is used to clean up after a completed guest checkout
     * to prevent data from leaking into a new shopping session.
     */
    protected function clearGuestSessionIfPresent(Request $request): void
    {
        // log the session data for debugging
        //Log::info('Session data before clearing guest session:', $request->session()->all());

        if ($request->session()->has('guest_customer_id')) {

            // Optionally, remove the guest customer record from the sessions table
            DB::table('sessions')->where('guest_customer_id', $request->session()->get('guest_customer_id'))->delete();

            $request->session()->forget('guest_customer_id');

            // 1. Remove all data from the session.
            $request->session()->flush();

            // 2. Save the now-empty session state to the database.
            $request->session()->save();

            // 3. Regenerate the session ID for a completely new session.
            $request->session()->regenerate();
        }
    }
}
