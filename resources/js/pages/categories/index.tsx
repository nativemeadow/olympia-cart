import RenderImage from '@/components/render-image';
import { Category } from '@/types/model-types';
import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';

import classes from './index.module.css';

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
                <div className={classes.gallery_grid}>
                    {categories.map((cat) => (
                        <div className={` ${classes[`gallery_${cat.slug}`]}`}>
                            <div className={classes.gallery_item}>
                                <RenderImage src={`category_images/${cat.image}`} alt={cat.title} className={classes.gallery_image} />

                                <Link href={`/categories/${cat.slug}`}>
                                    <span className={`${classes.gallery_card} ${classes['gallery_category-title']}`}>{cat.title}</span>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </>
    );
}
