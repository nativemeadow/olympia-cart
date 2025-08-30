import { Category } from '@/types/model-types';
import { Head, usePage } from '@inertiajs/react';

export default function CategoryShow() {
    const { category } = usePage<{ category: Category }>().props;

    return (
        <>
            <Head title={category.title} />

            <h1 className="mb-2 text-xl font-bold text-[#1b1b18] dark:text-[#EDEDEC]">{category.title}</h1>

            {category.image && (
                <img
                    src={`/category_images/${category.image}`}
                    alt={category.title}
                    className="mb-4 h-auto w-full max-w-md rounded-lg object-cover"
                />
            )}

            {category.description && <div className="prose dark:prose-invert" dangerouslySetInnerHTML={{ __html: category.description }} />}
        </>
    );
}
