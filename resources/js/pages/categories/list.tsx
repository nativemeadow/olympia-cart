import React from 'react';
import { Categories } from '@/types/model-types';
import classes from './list.module.css';
import { Link } from '@inertiajs/react';

type Props = {
    categories: Categories;
    basePath?: string;
};

const list = ({ categories, basePath }: Props) => {
    return (
        <div className={classes.list_grid}>
            {categories.map((category) => {
                const href = basePath ? `/categories/${basePath}/${category.slug}` : `/categories/${category.slug}`;

                return (
                    <div key={category.id} className={classes.list_item_wrapper}>
                        {category.image && (
                            <img className={classes.list_item_image} src={`/category_images/${category.image}`} alt={category.title} />
                        )}
                        <div className={classes.list_item_title_wrapper}>
                            <Link href={`/categories/${category.slug}`} className={classes.list_item_title_link}>
                                {category.title}
                            </Link>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default list;
