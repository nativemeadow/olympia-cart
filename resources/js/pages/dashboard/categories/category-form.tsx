import React, { FormEventHandler, useEffect, useState } from 'react';
import { useForm } from '@inertiajs/react';

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DialogClose, DialogFooter } from '@/components/ui/dialog';
import EditorComponent from '@/components/text-editor';
import { Media } from '@/types/model-types';
import MediaSelectionModal from '@/pages/dashboard/media/media-selection-modal';
import { CategoryHierarchy } from '@/types';
import { Category } from '@/types/model-types';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Pencil } from 'lucide-react';
import { generateSlug } from '@/utils/strings';
import { ImSpinner } from 'react-icons/im';
import AlertDialogComponent from '@/components/AlertDialog';
import cx from 'clsx';
import '@/../css/errors.css';
import classes from './category-form.module.css';
import { set } from 'react-hook-form';

type CategoryFormData = {
    title: string;
    slug: string;
    ancestorSlug: string;
    description: string;
    image: string;
    is_active: boolean;
    parent_id: number | null;
    media?: Media | null;
};

type FieldWrapperProps = {
    children: React.ReactNode;
    error?: string;
};

const FieldWrapper: React.FC<FieldWrapperProps> = ({ children, error }) => {
    return (
        <div className="error-container">
            {children}
            {error && <div className="input-error-bubble">{error}</div>}
        </div>
    );
};

const initialData: CategoryFormData = {
    title: '',
    slug: '',
    ancestorSlug: '',
    description: '',
    image: '',
    is_active: true,
    parent_id: null,
    media: null,
};

export default function CategoryForm({
    category,
    isEdit = false,
    onSuccess,
}: {
    category: CategoryHierarchy;
    isEdit?: boolean;
    onSuccess: () => void;
}) {
    const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(isEdit);
    const [isSaving, setIsSaving] = useState(false);
    const [errorDialogOpen, setErrorDialogOpen] = useState(false);
    const [errorDialogMessage, setErrorDialogMessage] = useState('');

    const { data, setData, post, put, processing, errors, reset, clearErrors } =
        useForm<CategoryFormData>(
            isEdit && category
                ? {
                      title: category?.title || '',
                      slug: category?.slug || '',
                      description: category?.description || '',
                      image: category?.image || '',
                      media: category?.media || null,
                      is_active: category?.is_active || false,
                      parent_id: isEdit
                          ? category?.parent_id || null
                          : category?.id || null,
                      ancestorSlug: '',
                  }
                : initialData,
        );

    useEffect(() => {
        if (isEdit && category) {
            const ancestors =
                category?.slug.split('/').slice(0, -1).join('/') || '';
            const ancestorSlugValue = ancestors ? ancestors + '/' : '';
            const initialSlug = category?.slug.split('/').slice(-1)[0] || '';
            setData({
                title: category.title,
                slug: initialSlug,
                description: category?.description || '',
                image: category?.image || '',
                media: category?.media || null,
                is_active: category?.is_active || false,
                parent_id: category.parent_id,
                ancestorSlug: ancestorSlugValue,
            });
            setIsSlugManuallyEdited(true);
        } else {
            const ancestorSlugValue = category?.slug ? category.slug + '/' : '';
            setData({
                ...initialData,
                parent_id: category?.id || null,
                ancestorSlug: ancestorSlugValue,
            });
            setIsSlugManuallyEdited(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    console.log('Initial form data:', category);

    const handleImageSelect = (image: Media) => {
        setData('media', image);
        setData('image', image.file_name);
    };

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        const options = {
            preserveState: true,
            onSuccess: () => {
                reset();
                setTimeout(() => {
                    onSuccess();
                }, 0);
            },
            onError: () => {
                // This callback can be used to handle errors, but for now,
                // we just need it to exist to prevent default behavior
                // and rely on the `errors` prop being populated.
            },
        };
        if (isEdit && category) {
            put(route('dashboard.categories.update', category.id), options);
        } else {
            post(route('dashboard.categories.store', category.id), options);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className={classes.formGrid}>
                <div className={classes.imageContainer}>
                    <h2>Image</h2>
                    {data.media ? (
                        <div className={classes.mediaItem}>
                            <div className={classes.mediaCard}>
                                <figure className={classes.mediaFigure}>
                                    <img
                                        src={
                                            '/' +
                                            data.media.file_path +
                                            data.media.file_name
                                        }
                                        alt={
                                            data.media.alt_text ||
                                            data.media.title
                                        }
                                        className={
                                            classes.product_image_preview
                                        }
                                    />
                                    <MediaSelectionModal
                                        onSelect={handleImageSelect}
                                        entityId={category?.id}
                                        mediaType="category"
                                    >
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="icon"
                                                    className={
                                                        classes.editButton
                                                    }
                                                    aria-label="Select or change image"
                                                >
                                                    <Pencil
                                                        className={
                                                            classes.pencilIcon
                                                        }
                                                    />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                Select or change image
                                            </TooltipContent>
                                        </Tooltip>
                                    </MediaSelectionModal>
                                </figure>
                            </div>
                        </div>
                    ) : (
                        <FieldWrapper error={errors['image']}>
                            <MediaSelectionModal
                                mediaType="category"
                                entityId={category?.id}
                                onSelect={(media) => {
                                    setData('media', media);
                                    setData('image', media.file_name);
                                }}
                            >
                                <div className={classes.addImagePlaceholder}>
                                    <p>Add image</p>
                                </div>
                                <span
                                    className={cx(classes.input, {
                                        'input-with-error': errors['image'],
                                    })}
                                ></span>
                            </MediaSelectionModal>
                        </FieldWrapper>
                    )}
                    {data.media ? (
                        <div>
                            <Label htmlFor="image" className={classes.label}>
                                Image File
                            </Label>
                            <Input
                                id="image"
                                name="image"
                                type="text"
                                disabled
                                value={data.image || ''}
                                onChange={(e) =>
                                    setData('image', e.target.value)
                                }
                            />
                        </div>
                    ) : null}
                </div>

                <div className={classes.fieldsContainer}>
                    <div className={classes.fieldRow}>
                        <Label htmlFor="title" className={classes.label}>
                            Title
                        </Label>
                        <div className={classes.inputWrapper}>
                            <FieldWrapper error={errors['title']}>
                                <Input
                                    id="title"
                                    value={data.title}
                                    onChange={(e) => {
                                        clearErrors('title');
                                        setData('title', e.target.value);
                                        if (!isSlugManuallyEdited) {
                                            clearErrors('title');
                                            setData(
                                                'slug',
                                                generateSlug(e.target.value),
                                            );
                                        }
                                    }}
                                    className={cx(classes.input, {
                                        'input-with-error': errors['title'],
                                    })}
                                />
                            </FieldWrapper>
                        </div>
                    </div>
                    <div className={classes.fieldRow}>
                        <Label htmlFor="slug" className={classes.label}>
                            Slug
                        </Label>
                        <div className={classes.inputWrapper}>
                            <span className={classes.ancestorSlug}>
                                {data.ancestorSlug}
                            </span>
                            <FieldWrapper error={errors['slug']}>
                                <Input
                                    id="slug"
                                    value={data.slug}
                                    onChange={(e) => {
                                        clearErrors('slug');
                                        setData('slug', e.target.value);
                                        setIsSlugManuallyEdited(true);
                                    }}
                                    className={cx(classes.input, {
                                        'input-with-error': errors['slug'],
                                    })}
                                />
                            </FieldWrapper>
                        </div>
                    </div>
                    <div className={classes.descriptionContainer}>
                        <Label htmlFor="description" className={classes.label}>
                            Description
                        </Label>
                        <FieldWrapper error={errors.description}>
                            <EditorComponent
                                id="description"
                                initialValue={data.description || ''}
                                handleEditorChange={(content: string) => {
                                    clearErrors('description');
                                    setData('description', content);
                                }}
                            />
                        </FieldWrapper>
                        {errors.description && (
                            <p className={classes.errorText}>
                                {errors.description}
                            </p>
                        )}
                    </div>
                    <div>
                        <Label htmlFor="slug" className={classes.label}>
                            Status
                        </Label>
                        <FieldWrapper error={errors['is_active']}>
                            <RadioGroup
                                onValueChange={(value) => {
                                    clearErrors('is_active');
                                    setData('is_active', value === '1');
                                }}
                                value={data.is_active ? '1' : '0'}
                                className={cx(classes.radioGroup, {
                                    'input-with-error': errors['is_active'],
                                })}
                            >
                                <div className={classes.radioItem}>
                                    <RadioGroupItem
                                        value="1"
                                        id="status-active"
                                        className={classes.radioInput}
                                    />
                                    <Label
                                        htmlFor="status-active"
                                        className={classes.label}
                                    >
                                        Active
                                    </Label>
                                </div>
                                <div className={classes.radioItem}>
                                    <RadioGroupItem
                                        value="0"
                                        id="status-inactive"
                                        className={classes.radioInput}
                                    />
                                    <Label
                                        htmlFor="status-inactive"
                                        className={classes.label}
                                    >
                                        Draft
                                    </Label>
                                </div>
                            </RadioGroup>
                        </FieldWrapper>
                    </div>
                </div>
            </div>
            <DialogFooter className={classes.stickyFooter}>
                <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={processing}>
                    {processing ? 'Saving...' : 'Save'}
                </Button>
            </DialogFooter>
        </form>
    );
}
