import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InputError } from '@/components/ui/input-error';
import { Label } from '@/components/ui/label';

import { router, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import axios from 'axios';

import classes from './register.module.css';
import LoginCodeInput from '@/components/login-code-input';

type Props = {
    isGuest: boolean;
};

const RegisterOnCheckout = ({ isGuest }: Props) => {
    // 'form', 'code', or 'success'
    const [view, setView] = useState('form');
    const [resendStatus, setResendStatus] = useState('');

    const { data, setData, processing, errors, isDirty, setError } = useForm(
        () => ({
            first_name: '',
            last_name: '',
            email: '',
            password: '',
            password_confirmation: '',
            code: '',
        }),
    );

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();

        const routeName = isGuest
            ? 'checkout.register.guest'
            : 'checkout.register';

        // We use axios to prevent Inertia's automatic redirect handling.
        axios
            .post(route(routeName), data)
            .then((response) => {
                if (response.data.status === 'code_sent') {
                    setView('code');
                } else {
                    // On success, we visit the current page to get the new props
                    // for the authenticated user, which re-renders the component.
                    router.visit(window.location.href, {
                        preserveState: false,
                    });
                }
            })
            .catch((error) => {
                // If registration fails (e.g., 422 validation error),
                // we can manually set the errors on the Inertia form hook.
                if (error.response && error.response.status === 422) {
                    setError(error.response.data.errors);
                }
            });
    };

    const handleVerifyCode: FormEventHandler = (e) => {
        e.preventDefault();
        axios
            .post(route('checkout.verify.guest'), {
                email: data.email,
                code: data.code,
            })
            .then(() => {
                router.visit(window.location.href, { preserveState: false });
            })
            .catch((error) => {
                if (error.response && error.response.status === 422) {
                    setError(error.response.data.errors);
                }
            });
    };

    const handleResendCode = () => {
        setResendStatus('Sending...');
        axios
            .post(route('checkout.resend.guest'), { email: data.email })
            .then(() => {
                setResendStatus('A new code has been sent.');
                setTimeout(() => setResendStatus(''), 3000);
            })
            .catch(() => {
                setResendStatus('Failed to send code. Please try again.');
            });
    };

    if (view === 'code') {
        return (
            <div className="text-center">
                <p className="mb-4">
                    We found an account with that email. A 6-digit code has been
                    sent to <strong>{data.email}</strong>. Please enter it
                    below.
                </p>
                <form onSubmit={handleVerifyCode} className="space-y-4">
                    <LoginCodeInput
                        value={data.code}
                        onChange={(value) => setData('code', value)}
                        error={errors.code}
                    />
                    <Button
                        type="submit"
                        disabled={processing}
                        className="w-full"
                    >
                        Verify and Continue
                    </Button>
                </form>
                <div className="mt-4 text-sm">
                    <button
                        onClick={handleResendCode}
                        className="text-indigo-600 hover:underline"
                        disabled={
                            !!resendStatus && resendStatus === 'Sending...'
                        }
                    >
                        Resend Code
                    </button>
                    {resendStatus && <p className="mt-2">{resendStatus}</p>}
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className={classes.form}>
            <div className={classes.name_grid}>
                <div className={classes.form_group}>
                    <Label htmlFor="first_name">First name</Label>
                    <Input
                        id="first_name"
                        type="text"
                        required
                        autoFocus
                        tabIndex={1}
                        autoComplete="given-name"
                        name="first_name"
                        placeholder="First name"
                        value={data.first_name}
                        onChange={(e) => setData('first_name', e.target.value)}
                        className={classes.input}
                    />
                    <InputError
                        message={errors.first_name}
                        className={classes.input_error}
                    />
                </div>
                <div className={classes.form_group}>
                    <Label htmlFor="last_name">Last name</Label>
                    <Input
                        id="last_name"
                        type="text"
                        required
                        tabIndex={2}
                        autoComplete="family-name"
                        name="last_name"
                        placeholder="Last name"
                        value={data.last_name}
                        onChange={(e) => setData('last_name', e.target.value)}
                        className={classes.input}
                    />
                    <InputError
                        message={errors.last_name}
                        className={classes.input_error}
                    />
                </div>
            </div>

            <div className={classes.form_group}>
                <Label htmlFor="email">Email address</Label>
                <Input
                    id="email"
                    type="email"
                    required
                    tabIndex={2}
                    autoComplete="email"
                    name="email"
                    placeholder="email@example.com"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    className={classes.input}
                />
                <InputError message={errors.email} />
            </div>
            {!isGuest && (
                <>
                    <div className={classes.form_group}>
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            required
                            tabIndex={3}
                            autoComplete="new-password"
                            name="password"
                            placeholder="Password"
                            value={data.password}
                            onChange={(e) =>
                                setData('password', e.target.value)
                            }
                            className={classes.input}
                        />
                        <InputError message={errors.password} />
                    </div>
                    <div className={classes.form_group}>
                        <Label htmlFor="password_confirmation">
                            Confirm password
                        </Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            required
                            tabIndex={4}
                            autoComplete="new-password"
                            name="password_confirmation"
                            placeholder="Confirm password"
                            value={data.password_confirmation}
                            onChange={(e) =>
                                setData('password_confirmation', e.target.value)
                            }
                            className={classes.input}
                        />
                        <InputError message={errors.password_confirmation} />
                    </div>
                </>
            )}
            <div>
                <Button
                    type="submit"
                    disabled={processing || !isDirty}
                    className="w-full"
                >
                    {isGuest ? 'Continue as Guest' : 'Register Account'}
                </Button>
            </div>
        </form>
    );
};

export default RegisterOnCheckout;
