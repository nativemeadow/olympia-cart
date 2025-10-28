import { usePage } from '@inertiajs/react';
import { Inertia } from '@inertiajs/inertia';
import { useEffect } from 'react';

interface User {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    // Add any other user properties you expect from your Laravel User model
}

// This interface defines the shape of the `auth` prop shared from Laravel
interface AuthProps {
    user: User | null;
}

export default function useAuth({
    middleware,
    redirectIfAuthenticated,
}: { middleware?: 'guest' | 'auth'; redirectIfAuthenticated?: string } = {}) {
    const { props } = usePage<{ auth: AuthProps }>();
    const user = props.auth?.user;

    /**
     * Note: In a typical Inertia application, auth middleware on the backend handles
     * redirects before the page is even sent to the client. This useEffect is a
     * client-side safeguard.
     */
    useEffect(() => {
        if (middleware === 'guest' && redirectIfAuthenticated && user) {
            Inertia.replace(redirectIfAuthenticated); // Redirect to dashboard or specified path if user is authenticated
        }
        if (middleware === 'auth' && !user) {
            Inertia.replace('/login');
        }
    }, [user, middleware, redirectIfAuthenticated]);

    return {
        user,
        isAuthenticated: !!user,
    };
}
