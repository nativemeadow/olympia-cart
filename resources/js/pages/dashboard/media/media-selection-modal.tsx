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

type MediaSelectionModalProps = {
    onSelect: (image: Media) => void;
    mediaType: 'product' | 'category';
    entityId?: number;
    children?: React.ReactNode;
};

const MediaSelectionModal = ({
    onSelect,
    mediaType = 'product',
    entityId,
    children,
}: MediaSelectionModalProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMediaProps, setModalMediaProps] =
        useState<PageProps<MediaComponentProps> | null>(null);

    const openMediaModal = async () => {
        // The modal can be opened without an entityId for general selection
        // if (!entityId) {
        //     console.error('No entityId provided for media selection.');
        //     return;
        // }

        try {
            const routeName =
                mediaType === 'category'
                    ? 'dashboard.category.media'
                    : 'dashboard.product.media';

            const params = entityId ? { id: entityId } : {};

            const response = await fetch(route(routeName, params));
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
