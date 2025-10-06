import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { UserMenuContent } from '@/components/user-menu-content';
import { useInitials } from '@/hooks/use-initials';
import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';

export function UserNav() {
    const { auth } = usePage<SharedData>().props;
    const getInitials = useInitials();

    if (!auth.user) {
        return null;
    }

    const fullName = [auth.user.first_name, auth.user.last_name].filter(Boolean).join(' ');

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative size-8 rounded-full">
                    <Avatar className="size-8">
                        <AvatarImage src={auth.user.avatar as string} alt={fullName} />
                        <AvatarFallback>{getInitials(fullName)}</AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <UserMenuContent
                    user={{
                        ...auth.user,
                        email_verified_at: auth.user.email_verified_at ?? null,
                    }}
                />
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
