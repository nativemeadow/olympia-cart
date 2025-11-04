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
        <div className={classes.grid}>
            {categories.map((category) => {
                const href = basePath
                    ? `/categories/${basePath}/${category.slug}`
                    : `/categories/${category.slug}`;

                return (
                    <div
                        key={category.slug}
                        className={`${classes.grid_cell} ${classes.image_container}`}
                    >
                        <Link
                            href={`/categories/${category.slug}`}
                            className={classes.list_item_title_link}
                        >
                            <div
                                key={category.id}
                                className={
                                    classes.list_grid_cell +
                                    ' ' +
                                    classes.image_container
                                }
                            >
                                {category.image && (
                                    <img
                                        className={classes.list_item_image}
                                        src={`/category_images/${category.image}`}
                                        alt={category.title}
                                    />
                                )}
                                <h2 className={classes.detail_title}>
                                    {category.title}
                                </h2>
                            </div>
                        </Link>
                    </div>
                );
            })}
        </div>
    );
};

export default list;
