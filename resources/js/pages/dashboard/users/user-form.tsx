import { useForm } from '@inertiajs/react';
import { FormEventHandler, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { User, Role } from '@/types';
import { ImSpinner } from 'react-icons/im';
import classes from './user-form.module.css';

interface UserFormProps {
    user: User;
    roles: Role[];
    onSuccess: () => void;
    isEdit: boolean;
}

export default function UserForm({
    user,
    roles,
    onSuccess,
    isEdit,
}: UserFormProps) {
    const { data, setData, post, put, processing, errors, reset } = useForm({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        password: '',
        password_confirmation: '',
        roles: user.roles?.map((role) => role.uuid) || [],
    });

    useEffect(() => {
        // Set form data when user prop changes for editing
        setData({
            first_name: user.first_name || '',
            last_name: user.last_name || '',
            email: user.email || '',
            password: '',
            password_confirmation: '',
            roles: user.roles?.map((role) => role.uuid) || [],
        });
    }, [user]);

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        const url = isEdit
            ? route('dashboard.users.update', user!.id)
            : route('dashboard.users.store');

        const httpMethod = isEdit ? put : post;

        httpMethod(url, {
            onSuccess: () => {
                onSuccess();
            },
            onError: (errors) => {
                console.error(errors);
            },
        });
    };

    const handleRoleChange = (roleId: string, checked: boolean) => {
        let selectedRoles = data.roles || [];
        if (checked) {
            selectedRoles = [...selectedRoles, roleId];
        } else {
            selectedRoles = selectedRoles.filter((id) => id !== roleId);
        }
        setData('roles', selectedRoles);
    };

    return (
        <form
            onSubmit={handleSubmit}
            id="user-edit-form"
            className={classes.form_container}
        >
            <div className="grid gap-4 py-4">
                <div className={classes.field_group}>
                    <Label htmlFor="first_name" className={classes.label}>
                        First Name
                    </Label>
                    <div className={classes.input_wrapper}>
                        <Input
                            id="first_name"
                            value={data.first_name}
                            onChange={(e) =>
                                setData('first_name', e.target.value)
                            }
                            className="w-full"
                        />
                        {errors.first_name && (
                            <p className={classes.error_message}>
                                {errors.first_name}
                            </p>
                        )}
                    </div>
                </div>
                <div className={classes.field_group}>
                    <Label htmlFor="last_name" className={classes.label}>
                        Last Name
                    </Label>
                    <div className={classes.input_wrapper}>
                        <Input
                            id="last_name"
                            value={data.last_name}
                            onChange={(e) =>
                                setData('last_name', e.target.value)
                            }
                            className="w-full"
                        />
                        {errors.last_name && (
                            <p className={classes.error_message}>
                                {errors.last_name}
                            </p>
                        )}
                    </div>
                </div>
                <div className={classes.field_group}>
                    <Label htmlFor="email" className={classes.label}>
                        Email
                    </Label>
                    <div className={classes.input_wrapper}>
                        <Input
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            className="w-full"
                        />
                        {errors.email && (
                            <p className={classes.error_message}>
                                {errors.email}
                            </p>
                        )}
                    </div>
                </div>
                <div className={classes.field_group}>
                    <Label htmlFor="password" className={classes.label}>
                        Password
                    </Label>
                    <div className={classes.input_wrapper}>
                        <Input
                            id="password"
                            type="password"
                            value={data.password}
                            onChange={(e) =>
                                setData('password', e.target.value)
                            }
                            className="w-full"
                        />
                        {errors.password && (
                            <p className={classes.error_message}>
                                {errors.password}
                            </p>
                        )}
                    </div>
                </div>
                <div className={classes.field_group}>
                    <Label
                        htmlFor="password_confirmation"
                        className={classes.label}
                    >
                        Confirm Password
                    </Label>
                    <div className={classes.input_wrapper}>
                        <Input
                            id="password_confirmation"
                            type="password"
                            value={data.password_confirmation}
                            onChange={(e) =>
                                setData('password_confirmation', e.target.value)
                            }
                            className="w-full"
                        />
                        {errors.password_confirmation && (
                            <p className={classes.error_message}>
                                {errors.password_confirmation}
                            </p>
                        )}
                    </div>
                </div>
                <div className={classes.field_group}>
                    <Label className={classes.label}>Roles</Label>
                    <div className={classes.checkbox_group}>
                        {roles.length > 0 &&
                            roles.map((role) => (
                                <div
                                    key={role.uuid}
                                    className={classes.checkbox_item}
                                >
                                    <Checkbox
                                        id={`role-${role.uuid}`}
                                        checked={data.roles.includes(role.uuid)}
                                        onCheckedChange={(checked) =>
                                            handleRoleChange(
                                                role.uuid,
                                                checked as boolean,
                                            )
                                        }
                                    />
                                    <Label htmlFor={`role-${role.uuid}`}>
                                        {role.name}
                                    </Label>
                                </div>
                            ))}
                        {errors.roles && (
                            <p className={classes.error_message}>
                                {errors.roles}
                            </p>
                        )}
                    </div>
                </div>
            </div>
            <Button
                type="submit"
                className="w-full"
                disabled={processing}
                form="user-edit-form"
            >
                {processing ? (
                    <ImSpinner className="animate-spin" />
                ) : isEdit ? (
                    'Update User'
                ) : (
                    'Create User'
                )}
            </Button>
        </form>
    );
}
