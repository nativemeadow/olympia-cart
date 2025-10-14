import React from 'react';
import parse from 'html-react-parser';
import { Product, Price } from '@/types/model-types';
import Card from '@/components/Card';

import classes from './results.module.css';

type ProductWithRank = Product & {
    rank: number;
};

type Props = {
    results: ProductWithRank[];
    searchTerm: string;
    resultCount: number;
};

const Index = ({ results, searchTerm, resultCount }: Props) => {
    console.log('Search results:', results);

    // remove hyphens
    searchTerm = searchTerm.replace(/-/g, ' ');
    // escaped spaces
    searchTerm = searchTerm.replace(/%20/g, ' ');
    // capitalize first letter of each word
    const itemLinkArray = searchTerm.split(' ');
    searchTerm = itemLinkArray
        .map((word) => {
            return word[0]?.toUpperCase() + word.slice(1, word.length);
        })
        .join(' ');

    return (
        <div>
            <h1>
                Search Results for "{searchTerm} - {resultCount} results"
            </h1>
            {results && results.length > 0 ? (
                <div className={classes['product-gallery']}>
                    {results.map(
                        (
                            result: ProductWithRank,
                            index: number, // Map over the results
                        ) => (
                            <Card key={index} results={result} />
                        ),
                    )}
                </div>
            ) : (
                <p>No results found.</p>
            )}
        </div>
    );
};

export default Index;
