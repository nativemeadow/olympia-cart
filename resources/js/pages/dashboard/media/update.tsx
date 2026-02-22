import React, { useEffect, useState } from 'react';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputError } from '@/components/ui/input-error';
import { useForm } from '@inertiajs/react';
import { Media } from '@/types/model-types';
import { ImageTypeOptions } from './readImageFile';
import { useImagePreview } from '@/hooks/useImagePreview';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import { FaPencilAlt } from 'react-icons/fa';

type UpdateImageProps = {
    media: Media;
};

const UpdateImage = ({ media }: UpdateImageProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const {
        file,
        fileName,
        fileSize,
        previewSrc,
        handleFileChange,
        clearFile,
    } = useImagePreview();

    const { data, setData, post, processing, errors, reset, clearErrors } =
        useForm({
            _method: 'PUT', // Method spoofing for file uploads
            title: media.title,
            description: media.description ?? '',
            name: media.file_name,
            alt_text: media.alt_text ?? '',
            file: null as File | null,
            type: media.type ?? '',
        });

    // Sync the file from the hook with the form state
    useEffect(() => {
        setData('file', file);
    }, [file]);

    const openModal = () => {
        setIsOpen(true);
        // Reset form data to media props when opening
        setData({
            _method: 'PUT',
            title: media.title,
            description: media.description ?? '',
            name: media.file_name,
            alt_text: media.alt_text ?? '',
            file: null,
            type: media.type ?? '',
        });
    };

    const closeModal = () => {
        setIsOpen(false);
        clearFile(); // Clear the preview when closing
        reset();
    };

    const imagePath =
        media.type === import.meta.env.VITE_PRODUCTS_IMAGE_TYPE
            ? (import.meta.env.VITE_PRODUCT_IMAGE_FOLDER ?? 'products')
            : (import.meta.env.VITE_CATEGORY_IMAGE_FOLDER ?? 'category_images');

    const existingImageUrl = `/${imagePath}/${media.file_name}`;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Use `post` for multipart/form-data, with `_method: 'PATCH'` for spoofing
        post(route('dashboard.media.update', media.id), {
            onSuccess: () => closeModal(),
            onError: () => {
                // display error message sent from the server in a toast
                if (errors.file) {
                    Toastify({
                        text: errors.file,
                        duration: 6000,
                        position: 'center',
                        backgroundColor: 'red',
                        close: true,
                    }).showToast();
                } else {
                    Toastify({
                        text: 'An error occurred while uploading the image. Please try again.',
                        duration: 6000,
                        position: 'center',
                        backgroundColor: 'red',
                        close: true,
                    }).showToast();
                }
            },
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={openModal}
                    aria-label={`Edit ${media.title}`}
                >
                    <FaPencilAlt className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Update Image</DialogTitle>
                    <DialogDescription>
                        Update the image details in the media library.
                    </DialogDescription>
                </DialogHeader>
                <form
                    id="update-image-form"
                    onSubmit={handleSubmit}
                    className="space-y-4"
                >
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="file-upload" className="text-right">
                                Replace File
                            </Label>
                            <div className="col-span-3">
                                <label
                                    htmlFor="file-upload"
                                    className="flex h-10 w-full cursor-pointer items-center rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                                >
                                    <span className="truncate">
                                        {fileName || (
                                            <span className="text-muted-foreground">
                                                Choose a new file...
                                            </span>
                                        )}
                                    </span>
                                </label>
                                <Input
                                    id="file-upload"
                                    name="file"
                                    type="file"
                                    className="sr-only" // Visually hide the real input
                                    onChange={(e) => {
                                        clearErrors('file');
                                        handleFileChange(e);
                                    }}
                                />
                            </div>
                            <InputError
                                message={errors.file}
                                className="col-span-3 col-start-2"
                            />
                        </div>
                        {/* Image Preview Section */}
                        <div className="grid grid-cols-4 items-start gap-4">
                            <Label className="text-right">Preview</Label>
                            <div className="col-span-3">
                                <img
                                    src={previewSrc || existingImageUrl}
                                    alt={
                                        previewSrc
                                            ? 'New image preview'
                                            : (media.alt_text ?? '')
                                    }
                                    className="max-h-64 w-full rounded object-contain"
                                />
                                {previewSrc && (
                                    <div className="mt-2 text-sm text-muted-foreground">
                                        <p>
                                            <strong>New File:</strong>{' '}
                                            {fileName}
                                        </p>
                                        {fileSize && (
                                            <p>
                                                <strong>Size:</strong>{' '}
                                                {(fileSize / 1024).toFixed(2)}{' '}
                                                KB
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="title" className="text-right">
                                Title
                            </Label>
                            <Input
                                id="title"
                                name="title"
                                type="text"
                                className="col-span-3"
                                value={data.title}
                                onChange={(e) => {
                                    clearErrors('title');
                                    setData('title', e.target.value);
                                }}
                            />
                            <InputError
                                message={errors.title}
                                className="col-span-3 col-start-2"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="description" className="text-right">
                                Description
                            </Label>
                            <Input
                                id="description"
                                name="description"
                                type="text"
                                className="col-span-3"
                                value={data.description}
                                onChange={(e) => {
                                    clearErrors('description');
                                    setData('description', e.target.value);
                                }}
                            />
                            <InputError
                                message={errors.description}
                                className="col-span-3 col-start-2"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="type" className="text-right">
                                Image Type
                            </Label>
                            <Select
                                onValueChange={(value) => {
                                    clearErrors('type');
                                    setData('type', value);
                                }}
                                name="type"
                                value={data.type || ''}
                            >
                                <SelectTrigger
                                    id="type"
                                    className="col-span-3 w-full max-w-48"
                                >
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        {ImageTypeOptions.map((option) => (
                                            <SelectItem
                                                key={option.value}
                                                value={option.value}
                                            >
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                            <InputError
                                message={errors.type}
                                className="col-span-3 col-start-2"
                            />
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="file_name" className="text-right">
                                File Name
                            </Label>
                            <Input
                                id="file_name"
                                name="file_name"
                                type="text"
                                className="col-span-3"
                                value={data.name}
                                onChange={(e) => {
                                    clearErrors('name');
                                    setData('name', e.target.value);
                                }}
                            />
                            <InputError
                                message={errors.name}
                                className="col-span-3 col-start-2"
                            />
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="alt_text" className="text-right">
                                Alt Text
                            </Label>
                            <Input
                                id="alt_text"
                                name="alt_text"
                                type="text"
                                className="col-span-3"
                                value={data.alt_text ?? ''}
                                onChange={(e) => {
                                    clearErrors('alt_text');
                                    setData('alt_text', e.target.value);
                                }}
                            />
                            <InputError
                                message={errors.alt_text}
                                className="col-span-3 col-start-2"
                            />
                        </div>
                    </div>
                </form>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline" onClick={closeModal}>
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button
                        color="primary"
                        disabled={processing}
                        className="w-full rounded bg-yellow-700 text-xl text-white"
                        type="submit"
                        form="update-image-form"
                    >
                        Update Image
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default UpdateImage;
