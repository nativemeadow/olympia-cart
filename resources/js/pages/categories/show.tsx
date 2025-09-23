import { Category } from '@/types/model-types';
import { Head, usePage } from '@inertiajs/react';
import List from '@/pages/categories/list';
import parse from 'html-react-parser';
import type { Categories } from '@/types/model-types';
import type { Product } from '@/types/model-types';
import ProductsList from '@/pages/categories/product-list';
import { useEffect } from 'react';

export default function CategoryShow() {
    const { category, category_path } = usePage<{ category: Category; category_path: string }>().props;

    useEffect(() => {
        const main = document.querySelector('main');
        if (main) {
            main.classList.add('category-list');
            return () => {
                main.classList.remove('category-list');
            };
        }
    }, []); // Empty dependency array ensures this runs only once on mount and unmount

    return (
        <div className="text-center">
            <Head title={category.title} />

            <h1 className="mb-2 text-xl font-bold text-[#1b1b18] dark:text-[#EDEDEC]">{category.title}</h1>

            {category.image && (
                <img
                    src={`/category_images/${category.image}`}
                    alt={category.title}
                    className="mx-auto mb-4 h-auto w-full max-w-md rounded-lg object-cover"
                />
            )}

            {category.description && <div className="prose dark:text-[#FFF]">{parse(category.description)}</div>}

            <List categories={category.children as Categories} basePath={category_path} />

            {category.products && category.products.length > 0 && (
                <div className="mt-8">
                    <h2 className="mb-4 text-lg font-semibold text-[#1b1b18] dark:text-[#EDEDEC]">Products in {category.title}</h2>
                    <ProductsList products={category.products as Product[]} categorySlug={category_path} />
                </div>
            )}
        </div>
    );
}
