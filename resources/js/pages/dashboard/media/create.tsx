import React, { useState, useEffect } from 'react';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputError } from '@/components/ui/input-error';
import { useForm } from '@inertiajs/react';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ImageTypeOptions } from './readImageFile';
import { useImagePreview } from '@/hooks/useImagePreview';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';

// By moving the form into its own component, we ensure that every time
// it's rendered, it gets a fresh set of state from its hooks.
const NewImageForm = ({
    setIsOpen,
}: {
    setIsOpen: (isOpen: boolean) => void;
}) => {
    const { file, fileName, fileSize, previewSrc, handleFileChange } =
        useImagePreview();

    const { data, setData, post, processing, errors, clearErrors } = useForm<{
        title: string;
        description: string;
        alt_text: string;
        file: File | null;
        type: string;
    }>({
        title: '',
        description: '',
        alt_text: '',
        file: null,
        type: '',
    });

    // Sync the file from the hook with the form state
    useEffect(() => {
        setData('file', file);
    }, [file]);

    // Set the title from the file name, if the title is empty
    useEffect(() => {
        if (fileName && !data.title) {
            const baseName = fileName.substring(0, fileName.lastIndexOf('.'));
            const formattedTitle = baseName.replace(/[_.-]/g, ' ');
            setData('title', formattedTitle);
        }
    }, [fileName]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('dashboard.media.store'), {
            onSuccess: () => {
                setIsOpen(false); // Close the dialog on success
            },
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
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Upload New Image</DialogTitle>
                <DialogDescription>
                    Upload a new image to the media library.
                </DialogDescription>
            </DialogHeader>
            <form
                id="new-image-form"
                onSubmit={handleSubmit}
                className="space-y-4"
            >
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="file-upload" className="text-right">
                            File
                        </Label>
                        <div className="col-span-3">
                            <label
                                htmlFor="file-upload"
                                className="flex h-10 w-full cursor-pointer items-center rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                            >
                                <span className="truncate">
                                    {fileName || (
                                        <span className="text-muted-foreground">
                                            Choose a file...
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
                    {previewSrc && (
                        <div className="grid grid-cols-4 items-start gap-4">
                            <Label className="text-right">Preview</Label>
                            <div className="col-span-3">
                                <img
                                    src={previewSrc}
                                    alt={fileName || 'Image preview'}
                                    className="max-h-64 w-full rounded object-contain"
                                />
                                <div className="mt-2 text-sm text-muted-foreground">
                                    <p>
                                        <strong>File Name:</strong> {fileName}
                                    </p>
                                    {fileSize && (
                                        <p>
                                            <strong>File Size:</strong>{' '}
                                            {(fileSize / 1024).toFixed(2)} KB
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

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
                        <Label htmlFor="alt_text" className="text-right">
                            Image Type
                        </Label>
                        <Select
                            onValueChange={(value) => {
                                clearErrors('type');
                                setData('type', value);
                            }}
                            name="type"
                        >
                            <SelectTrigger
                                id="type"
                                className="col-span-3 w-full max-w-48"
                            >
                                <SelectValue placeholder="Select a type" />
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
                        <Label htmlFor="alt_text" className="text-right">
                            Alt Text
                        </Label>
                        <Input
                            id="alt_text"
                            name="alt_text"
                            type="text"
                            className="col-span-3"
                            value={data.alt_text}
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
                    <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button
                    color="primary"
                    disabled={processing}
                    className="w-full rounded bg-yellow-700 text-xl text-white"
                    type="submit"
                    form="new-image-form"
                >
                    Upload Image
                </Button>
            </DialogFooter>
        </DialogContent>
    );
};

const NewImage = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline">New Image</Button>
                </DialogTrigger>
                {/*
                  Conditionally render the form component. When it's not rendered,
                  its state is destroyed. When it is rendered, it's created fresh.
                */}
                {isOpen && <NewImageForm setIsOpen={setIsOpen} />}
            </Dialog>
        </div>
    );
};

export default NewImage;
