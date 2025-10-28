import React from 'react';
import { User } from '@/types';

type Props = {
    type: 'billing' | 'shipping';
    user: User;
    onUpdate: (address: any) => void; // You can replace 'any' with a more specific type for your address
};

const AddressForm = ({ type, user, onUpdate }: Props) => {
    const updateAddress = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const address = {
            first_name: formData.get(`${type}-first-name`) as string,
            last_name: formData.get(`${type}-last-name`) as string,
            email: formData.get(`${type}-email`) as string,
            // Add other address fields here
        };
        onUpdate(address);
    };

    return (
        <div>
            <h4 className="mb-4 text-lg font-medium">
                {type === 'billing' ? 'Billing Address' : 'Shipping Address'}
            </h4>
            <form onSubmit={updateAddress}>
                {/* Form fields for address input go here */}
                <div>
                    <label
                        htmlFor={`${type}-first-name`}
                        className="block font-medium"
                    >
                        First Name
                    </label>
                    <input
                        type="text"
                        id={`${type}-first-name`}
                        defaultValue={user.first_name}
                        className="mt-1 w-full rounded border-gray-300"
                    />
                </div>
                <div>
                    <label
                        htmlFor={`${type}-last-name`}
                        className="block font-medium"
                    >
                        Last Name
                    </label>
                    <input
                        type="text"
                        id={`${type}-last-name`}
                        defaultValue={user.last_name}
                        className="mt-1 w-full rounded border-gray-300"
                    />
                </div>
                <div>
                    <label
                        htmlFor={`${type}-email`}
                        className="block font-medium"
                    >
                        Email
                    </label>
                    <input
                        type="email"
                        id={`${type}-email`}
                        defaultValue={user.email}
                        className="mt-1 w-full rounded border-gray-300"
                    />
                </div>
            </form>
        </div>
    );
};

export default AddressForm;
