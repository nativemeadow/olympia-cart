import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Role, User } from '@/types';
import UserForm from './user-form';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { ImSpinner } from 'react-icons/im';
import { useState } from 'react';
import { router } from '@inertiajs/react';
import classes from './user-actions.module.css';

export function AddUserAction() {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                        Add User
                    </Button>
                </DialogTrigger>
            </TooltipTrigger>
            <TooltipContent>
                <p>Add a new user with administrative access.</p>
            </TooltipContent>
        </Tooltip>
    );
}

export function EditUserAction({ user, roles }: { user: User; roles: Role[] }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSuccess = () => {
        setIsOpen(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                            Edit
                        </Button>
                    </DialogTrigger>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Edit {user.first_name}'s details and roles.</p>
                </TooltipContent>
            </Tooltip>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Edit {user.first_name} {user.last_name}
                    </DialogTitle>
                </DialogHeader>
                <UserForm
                    user={user}
                    roles={roles}
                    onSuccess={handleSuccess}
                    isEdit
                />
                <DialogFooter>
                    <DialogClose>Cancel</DialogClose>
                    <Button
                        onClick={() => {
                            setIsLoading(true);
                            // Simulate API call
                            setTimeout(() => {
                                setIsLoading(false);
                                handleSuccess();
                            }, 2000);
                        }}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <ImSpinner className="animate-spin" /> Saving...
                            </>
                        ) : (
                            'Save Changes'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export function DeleteUserAction({ user }: { user: User }) {
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <DialogTrigger asChild>
                    <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600"
                    >
                        Delete
                    </Button>
                </DialogTrigger>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        Are you sure you want to delete {user.first_name}?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. The user will lose access
                        to the admin dashboard immediately.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction className="bg-red-600 text-white">
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export function ViewUserDetailsAction({ user }: { user: User }) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    View Details
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {user.first_name} {user.last_name}
                    </DialogTitle>
                </DialogHeader>
                {/* User details content goes here */}
                <DialogFooter>
                    <DialogClose>Close</DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
