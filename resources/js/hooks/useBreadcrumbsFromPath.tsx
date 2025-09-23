import { usePage } from '@inertiajs/react';
import { useMemo } from 'react';
import breadcrumbsConfig from './breadcrumbsConfig.json';

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
    const { filters, exclude } = breadcrumbsConfig;

    return useMemo(() => {
        const originalSegments = path.split('/').filter(Boolean);

        // Combine titles from `filters` and `exclude` to get a list of segments to remove from the path.
        const titlesFromFilters = filters.map((filter) => filter.title);
        const allExcludedTitles = [...new Set([...titlesFromFilters, ...exclude])];
        const lowerCaseExcludedTitles = allExcludedTitles.map((title) => title.toLowerCase());

        // Filter out segments that should be excluded from the URL path.
        const filteredSegments = originalSegments.filter((segment) => !lowerCaseExcludedTitles.includes(segment.toLowerCase()));

        const breadcrumbs: Breadcrumb[] = [{ title: 'Home', href: '/' }];

        let currentPath = '';
        // Build breadcrumbs from the filtered segments, which corrects the hrefs for subsequent crumbs.
        filteredSegments.forEach((segment) => {
            currentPath += '/' + segment;
            breadcrumbs.push({
                title: segment
                    .split('-')
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' '),
                href: currentPath,
            });
        });

        return breadcrumbs;
    }, [path, filters, exclude]);
}
