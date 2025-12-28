import React from 'react';
import { ProductType } from '@/types';
import { Link } from '@inertiajs/react';

// Props for the Test component
type TestProps = {
    productData: {
        data: ProductType;
    };
    categorySlug: string;
};

const Test = ({ productData, categorySlug }: TestProps) => {
    const product: ProductType = productData.data;

    // Filter out variants that have the same price to avoid showing duplicate prices.
    const uniquePrices = (product.prices ?? []).filter(
        (price, index, self) =>
            index === self.findIndex((p) => p.price === price.price),
    );

    return (
        <div className="mx-auto max-w-4xl rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
            {/* Product Image */}
            <img
                src={`/products/${product.image || '/images/placeholder.jpg'}`}
                alt={`Image of ${product.title}`}
                className="mb-4 h-80 w-full rounded-lg object-cover"
            />

            {/* Product Title */}
            <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
                {product.title}
            </h1>

            {/* Product Description */}
            {product.description && (
                <p className="mb-4 text-base text-gray-700 dark:text-gray-300">
                    {product.description}
                </p>
            )}

            {/* Pricing Information */}
            <div className="mt-4 rounded-md border border-gray-200 p-4 dark:border-gray-700">
                <h2 className="mb-3 text-xl font-semibold text-gray-800 dark:text-gray-200">
                    Pricing
                </h2>
                {product.prices.length > 0 ? (
                    <ul className="space-y-2">
                        {product.prices.map((price) => (
                            <li
                                key={price.id}
                                className="flex items-baseline text-lg text-gray-700 dark:text-gray-300"
                            >
                                <span className="font-bold text-gray-900 dark:text-white">
                                    ${(price.price / 100).toFixed(2)}
                                </span>
                                {/* Use the 'description' field for the unit of measure */}
                                {price.description && (
                                    <span className="ml-1 text-sm text-gray-500 dark:text-gray-400">
                                        / {price.description}
                                    </span>
                                )}
                                {price.image && (
                                    <img
                                        src={`/products/${price.image}`}
                                        alt={`Image for ${price.description}`}
                                        className="ml-4 h-6 w-6 rounded-full object-cover"
                                    />
                                )}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500 dark:text-gray-400">
                        Pricing not available.
                    </p>
                )}
            </div>

            {/* Raw data for debugging */}
            <div className="mt-8">
                <h3 className="text-lg font-semibold">Raw Product Data</h3>
                <pre className="mt-2 rounded bg-gray-100 p-4 text-xs dark:bg-gray-900">
                    {JSON.stringify(product, null, 2)}
                </pre>
            </div>
        </div>
    );
};

export default Test;
