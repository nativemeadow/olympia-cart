import React from 'react';
import { User } from '@/types';
import { Head } from '@inertiajs/react';
import DashboardLayout from '@/layouts/dashboard-layout';

type PageProps = {
    roles: {
        id: number;
        name: string;
        permissions: {
            id: number;
            name: string;
        }[];
    }[];
    auth: {
        user: User;
    };
};

const Index = ({ auth, roles }: PageProps) => {
    return (
        <DashboardLayout user={auth.user}>
            <Head title="Roles" />
            <h1>Roles</h1>
            {roles.map((role) => (
                <div key={role.id} className="mb-4 rounded border p-4">
                    <h2 className="text-lg font-semibold">{role.name}</h2>
                    <p className="text-sm text-muted-foreground">
                        Permissions:
                    </p>
                    <ul className="list-disc pl-5">
                        {role.permissions.map((perm) => (
                            <li key={perm.id}>{perm.name}</li>
                        ))}
                    </ul>
                </div>
            ))}
        </DashboardLayout>
    );
};

export default Index;
