import { useInitials } from '../../hooks/use-initials';
import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('useInitials', () => {
    it('should return an empty string for an empty name', () => {
        const { result } = renderHook(() => useInitials());
        expect(result.current('')).toBe('');
    });

    it('should return an empty string for a name with only spaces', () => {
        const { result } = renderHook(() => useInitials());
        expect(result.current('   ')).toBe('');
    });

    it('should return the first letter for a single name', () => {
        const { result } = renderHook(() => useInitials());
        expect(result.current('John')).toBe('J');
    });

    it('should return the first letter for a single name with trailing spaces', () => {
        const { result } = renderHook(() => useInitials());
        expect(result.current('  John  ')).toBe('J');
    });

    it('should return the initials of the first and last name for a two-part name', () => {
        const { result } = renderHook(() => useInitials());
        expect(result.current('John McClintock')).toBe('JM');
    });

    it('should return the initials of the first and last name for a multi-part name', () => {
        const { result } = renderHook(() => useInitials());
        expect(result.current('John von Neumann')).toBe('JN');
    });

    it('should handle lowercase names correctly', () => {
        const { result } = renderHook(() => useInitials());
        expect(result.current('jane doe')).toBe('JD');
    });
});
