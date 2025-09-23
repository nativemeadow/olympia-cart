import RenderImage from '@/components/render-image';
import { Category } from '@/types/model-types';
import { Head, Link } from '@inertiajs/react';

import classes from './index.module.css';

type CategoriesIndexProps = {
    categories: Category[];
};

export default function CategoriesIndex({ categories }: CategoriesIndexProps) {
    return (
        <>
            <Head title="Product Categories" />
            <h2 className="mb-2 text-xl font-bold text-[#1b1b18] dark:text-[#EDEDEC]">Browse Our Product Categories</h2>
            {categories.length === 0 ? (
                <div className="text-center text-[#1b1b18] dark:border-[#3E3E3A] dark:text-[#EDEDEC]">No top-level categories found.</div>
            ) : (
                <div className={classes.gallery_grid}>
                    {categories.map((cat) => (
                        <div key={cat.id} className={` ${classes[`gallery_${cat.slug}`]}`}>
                            <Link href={`/categories/${cat.slug}`}>
                                <div className={classes.gallery_item}>
                                    <RenderImage src={`category_images/${cat.image}`} alt={cat.title} className={classes.gallery_image} />

                                    <span className={`${classes.gallery_card} ${classes['gallery_category-title']}`}>{cat.title}</span>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </>
    );
}
