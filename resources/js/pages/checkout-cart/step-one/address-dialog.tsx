import React, { FormEventHandler, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { Address } from '@/types/model-types';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputError } from '@/components/ui/input-error';
import { states } from '@/utils/counties-locals/states';
import { Checkbox } from '@/components/ui/checkbox';

interface AddressDialogProps {
    address: Address | 'new' | null;
    isOpen: boolean;
    onClose: () => void;
}

export function AddressDialog({
    address,
    isOpen,
    onClose,
}: AddressDialogProps) {
    const isNew = address === 'new';
    const formKey =
        address === null ? 'empty' : isNew ? 'new' : `address-${address.id}`;

    const { data, setData, post, patch, processing, errors, reset } = useForm(
        formKey,
        {
            phone: '',
            street1: '',
            street2: '',
            city: '',
            state: '',
            zip: '',
            billing: false,
            default: false,
        },
    );

    useEffect(() => {
        if (address && address !== 'new') {
            setData({
                phone: address.phone || '',
                street1: address.street1 || '',
                street2: address.street2 || '',
                city: address.city || '',
                state: address.state || '',
                zip: address.zip || '',
                billing: address.billing || false,
                default: address.default || false,
            });
        } else {
            reset();
        }
    }, [address]);

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        const options = {
            onSuccess: () => onClose(),
            preserveScroll: true,
        };
        if (isNew) {
            post(route('address.store'), options);
        } else if (address) {
            patch(route('address.update', address.id), options);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>
                        {isNew ? 'Add New Address' : 'Edit Address'}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="street1">Street Address</Label>
                        <Input
                            id="street1"
                            value={data.street1}
                            onChange={(e) => setData('street1', e.target.value)}
                            required
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
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="city">City</Label>
                            <Input
                                id="city"
                                value={data.city}
                                onChange={(e) =>
                                    setData('city', e.target.value)
                                }
                                required
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
                                required
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
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="zip">Zip Code</Label>
                            <Input
                                id="zip"
                                value={data.zip}
                                onChange={(e) => setData('zip', e.target.value)}
                                required
                            />
                            <InputError message={errors.zip} />
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
                                required
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
                                Set as default delivery
                            </Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline">
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button type="submit" disabled={processing}>
                            {isNew ? 'Save Address' : 'Update Address'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
