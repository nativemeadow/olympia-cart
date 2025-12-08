import RenderImage from '@/components/render-image';
import { Category } from '@/types/model-types';
import { Head, Link } from '@inertiajs/react';

import classes from './index.module.css';

type CategoriesIndexProps = {
    categories: Category[];
};

export default function CategoriesIndex({ categories }: CategoriesIndexProps) {
    return (
        <div className="flex h-full w-full flex-col">
            <Head title="Product Categories" />
            <h2 className="mb-2 px-8 text-xl font-bold text-[#1b1b18] dark:text-[#EDEDEC]">
                Browse Our Product Categories
            </h2>
            {categories.length === 0 ? (
                <div className="text-center text-[#1b1b18] dark:border-[#3E3E3A] dark:text-[#EDEDEC]">
                    No top-level categories found.
                </div>
            ) : (
                <div className={`${classes.gallery_grid} flex-grow px-8`}>
                    {categories.map((cat) => (
                        <div
                            key={cat.id}
                            // href={`/categories/${cat.slug}`}
                            className={`${classes.gallery_cell} ${classes[`gallery_${cat.slug}`]}`}
                        >
                            <div className={classes.gallery_item}>
                                <RenderImage
                                    src={`category_images/${cat.image}`}
                                    alt={cat.title}
                                    className={classes.gallery_image}
                                />

                                <span
                                    className={`${classes.gallery_card} ${classes['gallery_category-title']}`}
                                >
                                    <Link href={`/categories/${cat.slug}`}>
                                        {cat.title}
                                    </Link>
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
