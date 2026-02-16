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
import { MdOutlineEdit } from 'react-icons/md';
import { Media } from '@/types/model-types';
import clsx from 'clsx';

type UpdateImageProps = {
    media: Media;
};

const UpdateImage = ({ media }: UpdateImageProps) => {
    const [isOpen, setIsOpen] = useState(false);

    const { data, setData, post, patch, processing, errors, reset } = useForm({
        title: media.title,
        name: media.file_name,
        alt_text: media.alt_text,
        file: null,
    });
    const openModal = () => setIsOpen(true);
    const closeModal = () => setIsOpen(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(route('dashboard.media.update', media.id), {
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
                        <MdOutlineEdit />
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
                                <Label htmlFor="title" className="text-right">
                                    Title
                                </Label>
                                <Input
                                    id="title"
                                    name="title"
                                    type="text"
                                    className="col-span-3"
                                    value={data.title}
                                    onChange={(e) =>
                                        setData('title', e.target.value)
                                    }
                                />
                                <InputError
                                    message={errors.title}
                                    className="col-span-4"
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
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
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

export default UpdateImage;
