import DashboardLayout from '@/layouts/dashboard-layout';
import { Role, User } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { OrdersPaginated } from '@/types';
import { Search, X } from 'lucide-react';
import {
    ViewUserDetailsAction,
    AddUserAction,
    EditUserAction,
    DeleteUserAction,
} from './user-actions';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import styles from './users.module.css';
import { router } from '@inertiajs/react';
import roles from '../roles';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type UsersProps = {
    users: OrdersPaginated<User>;
    roles: Role[];
    filters: {
        search: string;
    };
    auth: {
        user: User;
    };
};

export default function Users({ users, roles, filters, auth }: UsersProps) {
    const { data, links, prev_page_url, next_page_url } = users;
    const [searchTerm, setSearchTerm] = useState(filters.search || '');

    console.log('Users:', users); // Debugging log to check the structure of users data
    console.log('Data:', data);
    console.log('Roles:', roles);

    const handleSearch = () => {
        router.get(
            route('dashboard.users'),
            { search: searchTerm },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const handleClear = () => {
        setSearchTerm('');
        router.get(
            route('dashboard.users'),
            {},
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    return (
        <DashboardLayout user={auth.user}>
            <Head title="Admin Users" />
            <h1 className="text-lg font-semibold md:text-2xl">
                Manage Admin Users
            </h1>
            <p className="text-sm text-muted-foreground">
                This is where you will manage users with administrative access
                and roles.
            </p>
            {/* User management UI goes here */}
            {users.data.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                    No users found. Use the search above to find users.
                </p>
            ) : (
                <>
                    {' '}
                    <div className={styles.searchContainer}>
                        <Input
                            type="text"
                            placeholder="Search by customer name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={styles.searchInput}
                        />
                        <Button onClick={handleSearch}>
                            <Search className={styles.buttonSize} />
                        </Button>
                        {searchTerm && (
                            <Button
                                variant="outline"
                                onClick={handleClear}
                                className={styles.clearButton}
                            >
                                <X className={styles.buttonSize} />
                            </Button>
                        )}
                    </div>
                    <ul className="divide-y divide-muted">
                        {users.data.map((user) => (
                            <li key={user.id} className="py-4">
                                <div className="flex items-center space-x-4">
                                    <div className="flex-shrink-0">
                                        {user.avatar ? (
                                            <img
                                                className="h-10 w-10 rounded-full"
                                                src={user.avatar}
                                                alt={`${user.first_name} ${user.last_name}`}
                                            />
                                        ) : (
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-300">
                                                <span className="text-sm font-medium text-gray-600">
                                                    {user.first_name.charAt(0)}
                                                    {user.last_name.charAt(0)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium">
                                            {user.first_name} {user.last_name}
                                        </p>
                                        <p className="hidden text-sm text-muted-foreground sm:block">
                                            {user.email}
                                        </p>
                                    </div>
                                    <div>
                                        <EditUserAction
                                            user={user}
                                            roles={roles}
                                        />
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                    <div className={styles.pagination}>
                        <Pagination>
                            <PaginationContent>
                                {prev_page_url && (
                                    <PaginationItem>
                                        <PaginationPrevious
                                            href={prev_page_url}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                router.visit(prev_page_url, {
                                                    preserveScroll: true,
                                                });
                                            }}
                                        />
                                    </PaginationItem>
                                )}
                                {links.map((link, index) => {
                                    if (!isNaN(Number(link.label))) {
                                        return (
                                            <PaginationItem key={index}>
                                                <PaginationLink
                                                    href={link.url!}
                                                    isActive={link.active}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        router.visit(
                                                            link.url!,
                                                            {
                                                                preserveScroll: true,
                                                            },
                                                        );
                                                    }}
                                                >
                                                    {link.label}
                                                </PaginationLink>
                                            </PaginationItem>
                                        );
                                    }
                                    return null;
                                })}
                                {next_page_url && (
                                    <PaginationItem>
                                        <PaginationNext
                                            href={next_page_url}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                router.visit(next_page_url, {
                                                    preserveScroll: true,
                                                });
                                            }}
                                        />
                                    </PaginationItem>
                                )}
                            </PaginationContent>
                        </Pagination>
                    </div>
                </>
            )}
        </DashboardLayout>
    );
}
