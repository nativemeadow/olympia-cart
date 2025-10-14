import { renderHook } from '@testing-library/react';
import { useBreadcrumbsFromPath } from '../useBreadcrumbsFromPath';
import { describe, it, expect, beforeEach, vi, afterEach, type MockInstance } from 'vitest';
import { usePage } from '@inertiajs/react';
import { type Page } from '@inertiajs/core';

// Mock @inertiajs/react
vi.mock('@inertiajs/react', () => ({
    usePage: vi.fn(),
}));

// Mock breadcrumbsConfig - path should be relative to the file being tested (the hook)
vi.mock('./useBreadcrumbsConfig.json', () => ({
    default: {
        filters: [{ title: 'filterme' }, { title: 'remove-this' }],
        exclude: ['admin', 'private'],
    },
}));

const mockPage = (url: string): Page => ({
    url,
    component: 'TestComponent',
    props: {
        auth: { user: null },
        errors: {},
    } as any,
    version: '1',
    rememberedState: {} as any,
    clearHistory: vi.fn() ? true : false,
    encryptHistory: vi.fn() ? true : false,
});

describe('useBreadcrumbsFromPath', () => {
    const mockedUsePage = vi.mocked(usePage);
    let locationSpy: MockInstance;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        locationSpy?.mockRestore();
    });

    it('returns Home for root path', () => {
        mockedUsePage.mockReturnValue(mockPage('/'));
        const { result } = renderHook(() => useBreadcrumbsFromPath());
        expect(result.current).toEqual([{ title: 'Home', href: '/' }]);
    });

    it('returns breadcrumbs for a simple path', () => {
        mockedUsePage.mockReturnValue(mockPage('/categories/soil'));
        const { result } = renderHook(() => useBreadcrumbsFromPath());
        expect(result.current).toEqual([
            { title: 'Home', href: '/' },
            { title: 'Categories', href: '/categories' },
            { title: 'Soil', href: '/categories/soil' },
        ]);
    });

    it('excludes segments from filters and exclude', () => {
        mockedUsePage.mockReturnValue(mockPage('/categories/filterme/admin/soil'));
        const { result } = renderHook(() => useBreadcrumbsFromPath());
        expect(result.current).toEqual([
            { title: 'Home', href: '/' },
            { title: 'Categories', href: '/categories' },
            { title: 'Soil', href: '/categories/soil' },
        ]);
    });

    it('handles kebab-case segments', () => {
        mockedUsePage.mockReturnValue(mockPage('/categories/soil-mulch'));
        const { result } = renderHook(() => useBreadcrumbsFromPath());
        expect(result.current).toEqual([
            { title: 'Home', href: '/' },
            { title: 'Categories', href: '/categories' },
            { title: 'Soil Mulch', href: '/categories/soil-mulch' },
        ]);
    });

    it('is case-insensitive for excluded segments', () => {
        mockedUsePage.mockReturnValue(mockPage('/Categories/Admin/Soil'));
        const { result } = renderHook(() => useBreadcrumbsFromPath());
        expect(result.current).toEqual([
            { title: 'Home', href: '/' },
            { title: 'Categories', href: '/Categories' },
            { title: 'Soil', href: '/Categories/Soil' },
        ]);
    });

    it('falls back to window.location.pathname if url is not a string', () => {
        locationSpy = vi.spyOn(window, 'location', 'get').mockReturnValue({ ...window.location, pathname: '/categories/soil' });

        mockedUsePage.mockReturnValue({ ...mockPage(''), url: {} as string }); // Force invalid URL
        const { result } = renderHook(() => useBreadcrumbsFromPath());

        expect(result.current).toEqual([
            { title: 'Home', href: '/' },
            { title: 'Categories', href: '/categories' },
            { title: 'Soil', href: '/categories/soil' },
        ]);
    });
});

// We recommend installing an extension to run vitest tests.
