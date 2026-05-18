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
import React, { useState, useEffect } from 'react';
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

    useEffect(() => {
        console.log('MediaSelectionModal props changed:', {
            onSelect,
            mediaType,
            entityId,
        });
    }, [onSelect, mediaType, entityId]);

    const openMediaModal = async () => {
        try {
            console.log('Opening media modal...');
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
            console.log('Media modal opened and data set.');
        } catch (error) {
            console.error('Failed to fetch media:', error);
        }
    };

    const handleModalUpdate = (props: PageProps<MediaComponentProps>) => {
        setModalMediaProps(props);
    };

    const handleImageSelect = (image: Media) => {
        onSelect(image);
        setIsModalOpen(false);
    };

    const handleClose = (e: React.MouseEvent<HTMLElement> | Event) => {
        console.log('handleClose called');
        e.preventDefault();
        e.stopPropagation();
        setIsModalOpen(false);
    };

    return (
        <>
            <div onClick={openMediaModal} style={{ display: 'inline-block' }}>
                {children}
            </div>
            <Dialog
                open={isModalOpen}
                onOpenChange={(open) => {
                    console.log('Dialog onOpenChange triggered with:', open);
                    setIsModalOpen(open);
                }}
            >
                <DialogContent
                    className="wide-dialog h-[80vh] overflow-y-auto"
                    onInteractOutside={handleClose}
                    aria-describedby="media selection"
                >
                    <DialogHeader>
                        <DialogTitle>Select an Image</DialogTitle>
                    </DialogHeader>
                    {modalMediaProps && (
                        <MediaComponent
                            {...modalMediaProps}
                            isModal={true}
                            onSelect={handleImageSelect}
                            onUpdate={handleModalUpdate}
                            mediaType={mediaType}
                            entityId={entityId}
                        />
                    )}
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline" onClick={handleClose}>
                                Close
                            </Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default MediaSelectionModal;
/**
 * 
 *     media,
filters,
onSelect,
onUpdate,
isModal,
mediaType,
 */
