import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import MediaComponent, {
    MediaProps as MediaComponentProps,
} from '@/pages/dashboard/media';
import { Media } from '@/types/model-types';
import React, { useState } from 'react';
import classes from './media-selection-modal.module.css';

type PageProps<T = {}> = T & {
    auth: any;
    flash: any;
};

interface MediaSelectionModalProps {
    onSelect: (image: Media) => void;
    productId: number;
    children: React.ReactNode;
}

const MediaSelectionModal = ({
    onSelect,
    productId,
    children,
}: MediaSelectionModalProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMediaProps, setModalMediaProps] =
        useState<PageProps<MediaComponentProps> | null>(null);

    const openMediaModal = async () => {
        try {
            const response = await fetch(
                route('dashboard.product.media', {
                    product_id: productId,
                }),
            );
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const mediaData = await response.json();
            setModalMediaProps(mediaData as PageProps<MediaComponentProps>);
            setIsModalOpen(true);
        } catch (error) {
            console.error('Failed to fetch media:', error);
        }
    };

    const handleImageSelect = (image: Media) => {
        onSelect(image);
        setIsModalOpen(false);
    };

    return (
        <>
            <div onClick={openMediaModal} style={{ display: 'inline-block' }}>
                {children}
            </div>
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="wide-dialog h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Select an Image</DialogTitle>
                    </DialogHeader>
                    {modalMediaProps && (
                        <MediaComponent
                            {...modalMediaProps}
                            isModal={true}
                            onSelect={handleImageSelect}
                            onUpdate={(newProps) =>
                                setModalMediaProps(newProps)
                            }
                        />
                    )}
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Close</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default MediaSelectionModal;
