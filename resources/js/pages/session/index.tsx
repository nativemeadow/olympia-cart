import React from 'react';
import { usePage } from '@inertiajs/react';
import { type SharedData } from '@/types';
import type { User } from '@/types';
import { Address } from '@/types/model-types';

type CustomerData = (User & { addresses: Address[] }) | null;

const Index = () => {
    const { auth, customer } = usePage<
        SharedData & { customer: CustomerData }
    >().props;

    return (
        <div className="round-xl w-1/2 overflow-auto bg-blue-50 p-10 shadow-md">
            {auth.user ? (
                <h1>
                    Welcome back,{' '}
                    {auth.user.first_name + ' ' + auth.user.last_name}!
                </h1>
            ) : (
                <h1>Welcome to our store! Please log in or register.</h1>
            )}
            {customer ? (
                <div className="mt-6">
                    <h2>Your Addresses:</h2>
                    {customer.addresses.length > 0 ? (
                        <ul>
                            {customer.addresses.map((address) => (
                                <li key={address.id}>
                                    {address.street1}, {address.city},{' '}
                                    {address.state} {address.zip}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No addresses on file.</p>
                    )}
                </div>
            ) : (
                <>
                    <p>Please provide customer information.</p>
                    <pre>{JSON.stringify(auth, null, 2)}</pre>
                    <pre>{JSON.stringify(auth.user, null, 2)}</pre>
                </>
            )}
        </div>
    );
};

export default Index;
