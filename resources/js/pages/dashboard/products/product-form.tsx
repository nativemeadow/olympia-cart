import React, { FormEventHandler, PropsWithChildren, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Product } from '@/types/model-types';
import { useForm } from '@inertiajs/react';
import classes from './products.module.css';
import { P } from 'node_modules/tailwindcss/dist/resolve-config-QUZ9b-Gn.mjs';

type ProductFormData = {
    product: Product;
};

const ProductForm = ({
    product,
    isEdit = false,
    onSuccess,
}: {
    product?: Product;
    isEdit?: boolean;
    onSuccess: () => void;
}) => {
    const { data, setData, post, put, processing, errors, reset } =
        useForm<ProductFormData>({
            product: product || ({} as Product),
        });

    return (
        <div>
            <h1>Product Form</h1>
        </div>
    );
};

export default ProductForm;
