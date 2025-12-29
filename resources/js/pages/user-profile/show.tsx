import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { PageProps } from '@/types';
import { Order } from '@/types/model-types';

import Heading from '@/components/heading';
import { Separator } from '@/components/ui/separator';
import SettingsNav from '@/layouts/settings/nav'; // We'll create this from the layout

// Import the components for each settings panel
import Profile from '@/pages/settings/profile';
import Password from '@/pages/settings/password';
import Appearance from '@/pages/settings/appearance';
import Orders from '@/pages/settings/orders';
import Address from '@/pages/settings/address'; // Assuming this component exists

// The PageProps will bring in all data needed for the child components.
export default function Show({
    mustVerifyEmail,
    status,
    orders,
    addresses,
}: PageProps<{
    mustVerifyEmail: boolean;
    status?: string;
    orders: Order[];
    addresses: any[]; // Replace 'any' with your Address type
}>) {
    const [activeTab, setActiveTab] = useState('profile');

    const renderActiveTab = () => {
        switch (activeTab) {
            case 'profile':
                return (
                    <Profile
                        mustVerifyEmail={mustVerifyEmail}
                        status={status}
                    />
                );
            case 'address':
                return <Address />;
            case 'orders':
                return <Orders />;
            case 'password':
                return <Password />;
            case 'appearance':
                return <Appearance />;
            default:
                return (
                    <Profile
                        mustVerifyEmail={mustVerifyEmail}
                        status={status}
                    />
                );
        }
    };

    return (
        <div className="px-4 py-6">
            <Head title="My Profile" />
            <Heading
                title="Settings"
                description="Manage your profile and account settings"
            />

            <div className="flex flex-col lg:flex-row lg:space-x-12">
                <aside className="w-full max-w-xl lg:w-48">
                    <SettingsNav
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                    />
                </aside>

                <Separator className="my-6 lg:hidden" />

                <div className="flex-1 md:max-w-2xl">
                    <section className="max-w-xl space-y-12">
                        {renderActiveTab()}
                    </section>
                </div>
            </div>
        </div>
    );
}
