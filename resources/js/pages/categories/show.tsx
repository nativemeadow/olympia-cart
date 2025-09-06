import { Category } from '@/types/model-types';
import { Head, usePage } from '@inertiajs/react';
import List from '@/pages/categories/list';
import { Categories } from '@/types/model-types';

export default function CategoryShow() {
    const { category, category_path } = usePage<{ category: Category; category_path: string }>().props;

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

            {category.description && <div className="prose dark:text-[#FFF]" dangerouslySetInnerHTML={{ __html: category.description }} />}

            <List categories={category.children as Categories} basePath={category_path} />
        </div>
    );
}
