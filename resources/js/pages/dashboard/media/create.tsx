import React, { useState } from 'react';
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
import clsx from 'clsx';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

const ImageTypeOptions = [
    {
        value: import.meta.env.CATEGORIES_IMAGE_TYPE ?? 'categories',
        label: 'Categories',
    },
    {
        value: import.meta.env.PRODUCTS_IMAGE_TYPE ?? 'products',
        label: 'Products',
    },
];

const NewImage = () => {
    const [isOpen, setIsOpen] = useState(false);

    const { data, setData, post, patch, processing, errors, reset } = useForm({
        title: '',
        name: '',
        alt_text: '',
        file: null,
        type: '',
    });

    const openModal = () => setIsOpen(true);
    const closeModal = () => setIsOpen(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('dashboard.media.store'), {
            onSuccess: () => {
                reset();
                closeModal();
            },
        });
    };

    return (
        <div>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" onClick={openModal}>
                        New Image
                    </Button>
                </DialogTrigger>
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
                                <Label htmlFor="title" className="text-right">
                                    Title
                                </Label>
                                <Input
                                    id="title"
                                    name="title"
                                    type="text"
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label
                                    htmlFor="file_name"
                                    className="text-right"
                                >
                                    File Name
                                </Label>
                                <Input
                                    id="file_name"
                                    name="file_name"
                                    type="text"
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label
                                    htmlFor="description"
                                    className="text-right"
                                >
                                    Description
                                </Label>
                                <Input
                                    id="description"
                                    name="description"
                                    type="text"
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="file" className="text-right">
                                    File
                                </Label>
                                <Input
                                    id="file"
                                    name="file"
                                    type="file"
                                    className="col-span-3"
                                />
                                <InputError
                                    message={errors.file}
                                    className="col-span-4"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label
                                    htmlFor="alt_text"
                                    className="text-right"
                                >
                                    Image Type
                                </Label>
                                <Select
                                    onValueChange={(value) =>
                                        setData('type', value)
                                    }
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
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label
                                    htmlFor="alt_text"
                                    className="text-right"
                                >
                                    Alt Text
                                </Label>
                                <Input
                                    id="alt_text"
                                    name="alt_text"
                                    type="text"
                                    className="col-span-3"
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
            </Dialog>
        </div>
    );
};

export default NewImage;
