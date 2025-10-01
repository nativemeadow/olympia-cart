<?php

namespace App\Listeners;

use App\Models\Cart;
use Illuminate\Auth\Events\Login;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Http\Request;

class MergeGuestCart
{
    /**
     * The request instance.
     *
     * @var \Illuminate\Http\Request
     */
    public $request;

    /**
     * Create the event listener.
     *
     * @param \Illuminate\Http\Request $request
     */
    public function __construct(Request $request)
    {
        $this->request = $request;
    }

    /**
     * Handle the event.
     *
     * @param  \Illuminate\Auth\Events\Login  $event
     * @return void
     */
    public function handle(Login $event)
    {
        $guestCart = Cart::with('items')->where('session_id', $this->request->session()->getId())->first();

        if (!$guestCart) {
            return;
        }

        $userCart = Cart::firstOrCreate(['user_id' => $event->user->id, 'status' => 'active']);

        foreach ($guestCart->items as $guestItem) {
            $userItem = $userCart->items()->where('sku', $guestItem->sku)->where('unit', $guestItem->unit)->first();
            if ($userItem) {
                $userItem->quantity += $guestItem->quantity;
                $userItem->save();
            } else {
                $guestItem->cart_id = $userCart->id;
                $guestItem->save();
            }
        }

        // Recalculate total and delete old guest cart
        $userCart->total = $userCart->items->sum(function ($item) {
            return $item->price * $item->quantity;
        });
        $userCart->save();

        $guestCart->delete();
    }
}
