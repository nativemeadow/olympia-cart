import { useEffect } from 'react';
import RenderImage from '@/components/render-image';
import { Category } from '@/types/model-types';
import { Head, Link } from '@inertiajs/react';

import classes from './index.module.css';

type CategoriesIndexProps = {
    categories: Category[];
};

const categoryImageFolder =
    import.meta.env.CATEGORY_IMAGE_FOLDER ?? 'category_images';

export default function CategoriesIndex({ categories }: CategoriesIndexProps) {
    useEffect(() => {
        document
            .getElementById('main-content')
            ?.classList.add('category-list-container');

        // Cleanup function to remove the class when the component unmounts
        return () => {
            document
                .getElementById('main-content')
                ?.classList.remove('category-list-container');
        };
    }, []);

    return (
        <div className="mx-auto flex h-full w-4/5 flex-col">
            <Head title="Product Categories" />
            <h2 className="mb-2 px-8 text-xl font-bold text-[#1b1b18] dark:text-[#EDEDEC]">
                Browse Our Product Categories
            </h2>
            {categories.length === 0 ? (
                <div className="text-center text-[#1b1b18] dark:border-[#3E3E3A] dark:text-[#EDEDEC]">
                    No top-level categories found.
                </div>
            ) : (
                <div className={`${classes.gallery_grid}`}>
                    {categories.map((cat) => (
                        <Link
                            key={cat.id}
                            href={`/categories/${cat.slug}`}
                            className={`${classes[`gallery_${cat.slug}`]}`}
                        >
                            <div className={classes.gallery_item}>
                                <RenderImage
                                    src={`${categoryImageFolder}/${cat.image}`}
                                    alt={cat.title}
                                    className={classes.gallery_image}
                                />

                                <span
                                    className={`${classes.gallery_card} ${classes['gallery_category-title']}`}
                                >
                                    {cat.title}
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
