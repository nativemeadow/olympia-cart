import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

import AuthLayout from '@/layouts/auth-layout';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';

const GuestCompleteRegistration = () => {
    const { data, setData, post, errors, processing, wasSuccessful } = useForm({
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('registration.complete'));
    };

    return (
        <AuthLayout
            title="Finish completing your registration"
            description="Enter your password below to complete your registration"
        >
            <Head title="Complete Your Registration" />

            <Card className="mx-auto max-w-md">
                <CardHeader>
                    <CardTitle>Set Your Password</CardTitle>
                    <CardDescription>
                        Create a password to complete your account setup. This
                        will allow you to log in directly in the future.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {wasSuccessful ? (
                        <div className="text-sm font-medium text-green-600">
                            Your password has been set successfully! You can now
                            log in with your email and new password.
                        </div>
                    ) : (
                        <form onSubmit={submit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={data.password}
                                    onChange={(e) =>
                                        setData('password', e.target.value)
                                    }
                                    autoComplete="new-password"
                                />
                                <InputError message={errors.password} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password_confirmation">
                                    Confirm Password
                                </Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    value={data.password_confirmation}
                                    onChange={(e) =>
                                        setData(
                                            'password_confirmation',
                                            e.target.value,
                                        )
                                    }
                                    autoComplete="new-password"
                                />
                                <InputError
                                    message={errors.password_confirmation}
                                />
                            </div>
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={processing}
                            >
                                Save Password
                            </Button>
                        </form>
                    )}
                </CardContent>
            </Card>
        </AuthLayout>
    );
};

export default GuestCompleteRegistration;
