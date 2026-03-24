import { createContext, useContext, useState, ReactNode } from 'react';

type ExpandedState = Set<number>;

interface CategoryExpandedContextType {
    expanded: ExpandedState;
    toggle: (id: number) => void;
    expand: (id: number) => void;
    expandAll: (ids: number[]) => void;
    collapseAll: () => void;
}

const CategoryExpandedContext =
    createContext<CategoryExpandedContextType | null>(null);

export function useCategoryExpanded() {
    const context = useContext(CategoryExpandedContext);
    if (!context) {
        throw new Error(
            'useCategoryExpanded must be used within a CategoryExpandedProvider',
        );
    }
    return context;
}

export function CategoryExpandedProvider({
    children,
}: {
    children: ReactNode;
}) {
    const [expanded, setExpanded] = useState<ExpandedState>(new Set());

    const toggle = (id: number) => {
        setExpanded((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const expand = (id: number) => {
        setExpanded((prev) => {
            const next = new Set(prev);
            next.add(id);
            return next;
        });
    };

    const expandAll = (ids: number[]) => {
        setExpanded((prev) => new Set([...prev, ...ids]));
    };

    const collapseAll = () => {
        setExpanded(new Set());
    };

    return (
        <CategoryExpandedContext.Provider
            value={{ expanded, toggle, expand, expandAll, collapseAll }}
        >
            {children}
        </CategoryExpandedContext.Provider>
    );
}
