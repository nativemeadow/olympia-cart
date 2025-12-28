import { Head } from '@inertiajs/react';
import SettingsLayout from '@/layouts/settings/layout';
import { PageProps } from '@/types';

// The PageProps will bring in `auth`, `mustVerifyEmail`, and `status` from the controller.
export default function Show({
    auth,
    mustVerifyEmail,
    status,
}: PageProps<{ mustVerifyEmail: boolean; status?: string }>) {
    return (
        <SettingsLayout>
            <Head title="My Profile" />

            <div className="space-y-6">
                {/* You can also include other forms like the delete user form if needed */}
            </div>
        </SettingsLayout>
    );
}
