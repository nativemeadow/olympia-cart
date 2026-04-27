import DashboardLayout from '@/layouts/dashboard-layout';
import { User } from '@/types/model-types';
import { Head, usePage } from '@inertiajs/react';
import { OrdersPaginated } from '@/types';
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

type PageProps = {
    auth: {
        user: User;
    };
};

type UsersProps = {
    users: OrdersPaginated<User>;
    filters: {
        search: string;
    };
    auth: {
        user: User;
    };
};

export default function Users({ users, filters, auth }: UsersProps) {
    const { data, links, prev_page_url, next_page_url } = users;

    //const { auth } = usePage<PageProps>().props;
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
                                        {/* Actions like edit/delete would go here */}
                                        <button
                                            className="text-sm text-blue-600 hover:underline"
                                            onClick={() => {
                                                // Handle edit user
                                            }}
                                        >
                                            Edit
                                        </button>
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
