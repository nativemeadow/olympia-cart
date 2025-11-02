import React from 'react';
import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputError } from '@/components/ui/input-error';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { type Address as AddressType } from '@/types/model-types';
import { states } from '@/utils/counties-locals/states';

import { Head, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Address settings',
        href: '/settings/address',
    },
];

// Removed unused resultData type

interface AddressFormProps {
    address?: AddressType;
    onCancel: () => void;
}

function AddressForm({ address, onCancel }: AddressFormProps) {
    const { data, setData, post, patch, processing, errors, reset } = useForm({
        phone: address?.phone || '',
        street1: address?.street1 || '',
        street2: address?.street2 || '',
        city: address?.city || '',
        state: address?.state || '',
        zip: address?.zip || '',
        billing: address?.billing || false,
        default: address?.default || false,
    });

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        const options = {
            onSuccess: () => onCancel(),
            preserveScroll: true,
        };
        if (address) {
            patch(route('address.update', address.id), options);
        } else {
            post(route('address.store'), options);
        }
    };

    return (
        <Card>
            <form onSubmit={handleSubmit}>
                <CardHeader>
                    <CardTitle>
                        {address ? 'Edit Address' : 'Add New Address'}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="street1">Street Address</Label>
                        <Input
                            id="street1"
                            value={data.street1}
                            onChange={(e) => setData('street1', e.target.value)}
                        />
                        <InputError message={errors.street1} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="street2">
                            Apt, Suite, etc. (optional)
                        </Label>
                        <Input
                            id="street2"
                            value={data.street2}
                            onChange={(e) => setData('street2', e.target.value)}
                        />
                        <InputError message={errors.street2} />
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div className="grid gap-2">
                            <Label htmlFor="city">City</Label>
                            <Input
                                id="city"
                                value={data.city}
                                onChange={(e) =>
                                    setData('city', e.target.value)
                                }
                            />
                            <InputError message={errors.city} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="state">State</Label>
                            <select
                                id="state"
                                value={data.state}
                                onChange={(e) =>
                                    setData('state', e.target.value)
                                }
                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <option value="">Select a state</option>
                                {states.map((s) => (
                                    <option key={s.abbreviation} value={s.name}>
                                        {s.name}
                                    </option>
                                ))}
                            </select>
                            <InputError message={errors.state} />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <div className="grid grid-cols-2 gap-2">
                            <div className="grid gap-2">
                                <Label htmlFor="zip">Zip Code</Label>
                                <Input
                                    id="zip"
                                    value={data.zip}
                                    onChange={(e) =>
                                        setData('zip', e.target.value)
                                    }
                                />
                                <InputError message={errors.zip} />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                                id="phone"
                                type="tel"
                                value={data.phone}
                                onChange={(e) =>
                                    setData('phone', e.target.value)
                                }
                            />
                            <InputError message={errors.phone} />
                        </div>
                    </div>
                    <div className="flex items-center space-x-4 pt-4">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="billing"
                                checked={data.billing}
                                onCheckedChange={(checked) =>
                                    setData('billing', !!checked)
                                }
                            />
                            <Label htmlFor="billing">
                                Set as billing address
                            </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="default"
                                checked={data.default}
                                onCheckedChange={(checked) =>
                                    setData('default', !!checked)
                                }
                            />
                            <Label htmlFor="default">
                                Set as default delivery address
                            </Label>
                        </div>
                    </div>
                    <div>
                        <InputError message={errors.billing} />
                        <InputError message={errors.default} />
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={processing}>
                        {address ? 'Update' : 'Save'} Address
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}

export default function Address({ addresses }: { addresses: AddressType[] }) {
    const [editingAddress, setEditingAddress] = useState<
        AddressType | null | 'new'
    >(null);
    const { flash } = usePage<SharedData>().props;
    const { delete: destroy, processing } = useForm();

    const handleCancel = () => {
        setEditingAddress(null);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Address settings" />
            <SettingsLayout>
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <HeadingSmall
                            title="Your Addresses"
                            description="Manage your billing and delivery addresses."
                        />
                        {editingAddress === null && (
                            <Button onClick={() => setEditingAddress('new')}>
                                Add New Address
                            </Button>
                        )}
                    </div>

                    {/* {flash.success && (
                        <div className="mb-4 rounded-md bg-green-100 p-4 text-sm text-green-700" role="alert">
                            {flash.success}
                        </div>
                    )} */}

                    {editingAddress !== null ? (
                        <AddressForm
                            address={
                                editingAddress === 'new'
                                    ? undefined
                                    : editingAddress
                            }
                            onCancel={handleCancel}
                        />
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2">
                            {addresses.map((address) => (
                                <Card key={address.id}>
                                    <CardHeader>
                                        <CardTitle>{address.street1}</CardTitle>
                                        <CardDescription>
                                            {address.street1},{' '}
                                            {address.street2 &&
                                                `${address.street2}, `}
                                            {`${address.city}, ${address.state} ${address.zip}, `}
                                            {address.phone &&
                                                `Phone: ${address.phone}`}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex gap-4 text-sm">
                                        {address.billing ? (
                                            <span className="rounded-full bg-blue-100 px-2 py-1 text-blue-800">
                                                Billing
                                            </span>
                                        ) : null}
                                        {address.default ? (
                                            <span className="rounded-full bg-green-100 px-2 py-1 text-green-800">
                                                Default Delivery
                                            </span>
                                        ) : null}
                                    </CardContent>
                                    <CardFooter className="flex justify-end gap-2">
                                        <Button
                                            variant="outline"
                                            onClick={() =>
                                                setEditingAddress(address)
                                            }
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            onClick={() =>
                                                destroy(
                                                    route(
                                                        'address.destroy',
                                                        address.id,
                                                    ),
                                                    { preserveScroll: true },
                                                )
                                            }
                                            disabled={processing}
                                        >
                                            Delete
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
