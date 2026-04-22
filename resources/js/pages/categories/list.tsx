import React from 'react';
import RenderImage from '@/components/render-image';
import { Categories } from '@/types/model-types';
import classes from './list.module.css';
import { Link } from '@inertiajs/react';

type Props = {
    categories: Categories;
    basePath?: string;
};

const categoryImageFolder =
    import.meta.env.VITE_CATEGORY_IMAGE_FOLDER ?? 'category_images';

const list = ({ categories, basePath }: Props) => {
    return (
        <div className={classes.grid}>
            {categories.map((category) => (
                <div key={category.slug} className={`${classes.grid_cell}`}>
                    <Link
                        href={`/categories/${category.slug}`}
                        className={classes.list_item_title_link}
                    >
                        <div
                            key={category.id}
                            className={classes.image_container}
                        >
                            {category.image && (
                                <RenderImage
                                    className={classes.list_item_image}
                                    src={`/${categoryImageFolder}/${category.image}`}
                                    alt={category.title}
                                />
                            )}
                            <h2
                                className={`${classes.gallery_card} ${classes['gallery_category-title']}`}
                            >
                                {category.title}
                            </h2>
                        </div>
                    </Link>
                </div>
            ))}
        </div>
    );
};

export default list;
