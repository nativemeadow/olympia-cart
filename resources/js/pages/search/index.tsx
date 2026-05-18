import React from 'react';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import { Product } from '@/types/model-types';
import Card from '@/components/Card';
import classes from './results.module.css';
import { Paginator } from '@/types';
import { router } from '@inertiajs/react';

type Props = {
    products: Paginator<Product>;
    searchTerm: string;
};

const Index = ({ products, searchTerm }: Props) => {
    const {
        data: results,
        total: resultCount,
        links,
        prev_page_url,
        next_page_url,
    } = products;

    // format search term for display
    const formattedSearchTerm = searchTerm
        .replace(/[-_]/g, ' ')
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

    return (
        <div>
            <h1>
                Search Results for "{formattedSearchTerm}" - {resultCount}{' '}
                results
            </h1>
            {results && results.length > 0 ? (
                <>
                    <div className={classes['product-gallery']}>
                        {results.map((result: Product) => (
                            <Card key={result.id} product={result} />
                        ))}
                    </div>
                    <div className={classes.pagination}>
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
                                    if (
                                        !isNaN(Number(link.label)) ||
                                        link.label === '...'
                                    ) {
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
            ) : (
                <p>No products found.</p>
            )}
        </div>
    );
};

export default Index;
