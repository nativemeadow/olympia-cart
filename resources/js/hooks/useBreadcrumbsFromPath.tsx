import { usePage } from '@inertiajs/react';
import { useMemo } from 'react';

type Breadcrumb = {
    title: string;
    href: string;
};

/**
 * Converts a router path like "/categories/soil" to breadcrumb paths:
 * [
 *   { title: "Home", href: "/" },
 *   { title: "Categories", href: "/categories" },
 *   { title: "Soil", href: "/categories/soil" }
 * ]
 */
export function useBreadcrumbsFromPath(): Breadcrumb[] {
    const { url } = usePage();
    const path = typeof url === 'string' ? url : window.location.pathname;

    return useMemo(() => {
        const segments = path.split('/').filter(Boolean);
        const breadcrumbs: Breadcrumb[] = [{ title: 'Home', href: '/' }];

        let currentPath = '';
        segments.forEach((segment, idx) => {
            currentPath += '/' + segment;
            breadcrumbs.push({
                title: segment.charAt(0).toUpperCase() + segment.slice(1),
                href: currentPath,
            });
        });

        return breadcrumbs;
    }, [path]);
}
