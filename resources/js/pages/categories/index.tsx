import RenderImage from '@/components/render-image';
import { Category } from '@/types/model-types';
import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function CategoriesIndex() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/categories/top-level')
            .then((res) => res.json())
            .then((data) => {
                setCategories(data);
                setLoading(false);
            });
    }, []);

    return (
        <>
            <Head title="Product Categories" />
            <h2 className="mb-2 text-xl font-bold text-[#1b1b18] dark:text-[#EDEDEC]">Browse Our Product Categories</h2>
            {loading ? (
                <div className="border-b border-[#e5e7eb] text-center text-[#1b1b18] dark:border-[#3E3E3A] dark:text-[#EDEDEC]">Loading...</div>
            ) : categories.length === 0 ? (
                <div className="text-center text-[#1b1b18] dark:border-[#3E3E3A] dark:text-[#EDEDEC]">No top-level categories found.</div>
            ) : (
                <div className="category-grid">
                    {categories.map((cat) => (
                        <div key={cat.id} className={`category-grid-cell gallery_${cat.slug}`}>
                            <RenderImage
                                src={`category_images/${cat.image}`}
                                alt={cat.title}
                                width="100%"
                                height="auto"
                                className="category-grid-image"
                            />
                            <div className="category-grid-link-wrapper">
                                <Link href={`/categories/${cat.slug}`} className="category-grid-link">
                                    {cat.title}
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </>
    );
}
