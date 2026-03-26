import { useState, useEffect } from 'react';
import DashboardLayout from '@/layouts/dashboard-layout';
import { Paginated, PageProps } from '@/types';
import { Media } from '@/types/model-types';
import { Head, Link, router } from '@inertiajs/react';
import { Button, buttonVariants } from '@/components/ui/button';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
} from '@/components/ui/pagination';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { clsx } from 'clsx';
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu';
import { Input } from '@/components/ui/input';
import UploadNewImage from './create';
import UpdateImage from './update';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Trash2 } from 'lucide-react';

export type MediaProps = {
    media: Paginated<Media>;
    filters: {
        sort_column: string;
        order: string;
        per_page: string;
        search_term: string;
    };
};

const MediaComponent = ({
    media,
    filters,
    onSelect,
    onUpdate,
    isModal,
    mediaType,
}: MediaProps &
    PageProps & {
        onSelect?: (image: Media) => void;
        onUpdate?: (props: PageProps<MediaProps>) => void;
        isModal?: boolean;
        mediaType?: 'product' | 'category';
    }) => {
    const { links, meta } = media;
    const [mediaItems, setMediaItems] = useState<Media[]>(media.data);
    const [mediaToDelete, setMediaToDelete] = useState<Media | null>(null);

    useEffect(() => {
        setMediaItems(media.data);
    }, [media.data]);

    const handleImageAdded = (newImage: Media) => {
        setMediaItems((prevItems) => [newImage, ...prevItems]);
        if (onSelect) {
            onSelect(newImage);
        }
    };

    const handleImageUpdated = (updatedImage: Media) => {
        setMediaItems((prevItems) =>
            prevItems.map((item) =>
                item.id === updatedImage.id ? updatedImage : item,
            ),
        );
    };

    const handleModalNavigation = async (url: string) => {
        if (!url || !onUpdate) return;
        try {
            const response = await fetch(url);
            const newData = await response.json();
            onUpdate(newData);
        } catch (error) {
            console.error('Failed to fetch new media page:', error);
        }
    };

    const handlePerPageChange = (per_page: string) => {
        const routeName = isModal
            ? 'dashboard.product.media'
            : 'dashboard.media';
        router.get(
            route(routeName),
            { ...filters, per_page },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const handleSortChange = (value: string) => {
        const [sort_column, order] = value.includes('created_at')
            ? // split the value of created_at from the order (asc or desc) to get the sort_column and order separately
              value.endsWith('_asc')
                ? ['created_at', 'asc']
                : ['created_at', 'desc']
            : //  if the value does not include created_at, it means it is sorting by title, so we split the value of title from the order (asc or desc) to get the sort_column and order separately
              value.split('_');
        const routeName = isModal
            ? 'dashboard.product.media'
            : 'dashboard.media';
        router.get(
            route(routeName),
            { ...filters, sort_column, order },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const search_term = e.target.value;
        const routeName = isModal
            ? 'dashboard.product.media'
            : 'dashboard.media';
        router.get(
            route(routeName),
            { ...filters, search_term },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const handleDelete = () => {
        if (mediaToDelete) {
            router.delete(route('dashboard.media.destroy', mediaToDelete.id), {
                onSuccess: () => {
                    setMediaItems((prevItems) =>
                        prevItems.filter(
                            (item) => item.id !== mediaToDelete.id,
                        ),
                    );
                    setMediaToDelete(null);
                },
                preserveState: true,
            });
        }
    };

    const MediaContent = () => (
        <>
            {!isModal && (
                <>
                    <Head title="Media" />
                    <h1 className="text-lg font-semibold md:text-2xl">
                        Manage Media
                    </h1>
                </>
            )}
            <div className="flex items-center justify-between gap-2">
                <UploadNewImage
                    onImageAdded={handleImageAdded}
                    imageType={mediaType}
                />
                <div className="flex flex-grow items-center justify-end gap-2">
                    <Input
                        name="search"
                        placeholder="Search media..."
                        className="w-64"
                        value={filters.search_term || ''}
                        onChange={handleSearchChange}
                    />
                    <Select
                        value={`${filters.sort_column}_${filters.order}`}
                        onValueChange={handleSortChange}
                    >
                        <SelectTrigger className="w-45">
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Sort By</SelectLabel>
                                <SelectItem value="type_asc">
                                    Type A-Z
                                </SelectItem>
                                <SelectItem value="type_desc">
                                    Type Z-A
                                </SelectItem>
                                <SelectItem value="created_at_desc">
                                    Newest First
                                </SelectItem>
                                <SelectItem value="created_at_asc">
                                    Oldest First
                                </SelectItem>
                                <SelectItem value="title_asc">
                                    Title A-Z
                                </SelectItem>
                                <SelectItem value="title_desc">
                                    Title Z-A
                                </SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {mediaItems.map((image) => (
                    <div key={image.id} className="flex flex-col gap-2">
                        <div className="group relative">
                            <figure className="aspect-square w-full overflow-hidden rounded-md border">
                                <img
                                    src={image.url + '/' + image.file_name}
                                    alt={image.alt_text || image.title}
                                    title={image.title}
                                    className="h-full w-full object-cover transition-all group-hover:brightness-75"
                                />
                            </figure>
                            <div className="absolute right-2 bottom-2 flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                                {onSelect ? (
                                    <Button
                                        size="sm"
                                        onClick={() => onSelect(image)}
                                    >
                                        Select
                                    </Button>
                                ) : (
                                    <>
                                        <UpdateImage
                                            media={image}
                                            onImageUpdated={handleImageUpdated}
                                        />
                                        <Button
                                            variant="destructive"
                                            size="icon"
                                            onClick={() =>
                                                setMediaToDelete(image)
                                            }
                                        >
                                            <Trash2 className="h-4 w-4 text-white" />
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="flex w-full flex-col items-start">
                            <p className="font-semibold">{image.title}</p>
                            <p className="text-xs text-muted-foreground">
                                {new Date(
                                    image.created_at,
                                ).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination Controls */}
            <div className="mt-6 flex items-center justify-between">
                <div>
                    {meta && ( // This check prevents the error
                        <p className="text-sm text-muted-foreground">
                            Showing {meta.from} to {meta.to} of {meta.total}
                            results
                        </p>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <Select
                        value={filters.per_page}
                        onValueChange={handlePerPageChange}
                    >
                        <SelectTrigger className="w-45">
                            <SelectValue placeholder="Items per page" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                {[10, 20, 40, 80].map((perPage) => (
                                    <SelectItem
                                        key={perPage}
                                        value={`${perPage}`}
                                    >
                                        {perPage} per page
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
                <Pagination>
                    <PaginationContent>
                        {links &&
                            links.map((link, index) => {
                                const isFirst = index === 0;
                                const isLast = index === links.length - 1;
                                const isEllipsis = link.label.includes('...');

                                // Handle Previous button
                                if (isFirst) {
                                    return isModal ? (
                                        <PaginationItem key={index}>
                                            <Button
                                                variant="ghost"
                                                onClick={() =>
                                                    handleModalNavigation(
                                                        link.url || '',
                                                    )
                                                }
                                                disabled={!link.url}
                                                className="gap-1 pl-2.5"
                                            >
                                                <LuChevronLeft className="h-4 w-4" />
                                                <span>Previous</span>
                                            </Button>
                                        </PaginationItem>
                                    ) : (
                                        <PaginationItem key={index}>
                                            <Link
                                                href={link.url || '#'}
                                                className={clsx(
                                                    buttonVariants({
                                                        variant: 'ghost',
                                                    }),
                                                    'gap-1 pl-2.5', // Style from shadcn
                                                    !link.url &&
                                                        'pointer-events-none text-muted-foreground',
                                                )}
                                            >
                                                <LuChevronLeft className="h-4 w-4" />
                                                <span>Previous</span>
                                            </Link>
                                        </PaginationItem>
                                    );
                                }

                                // Handle Next button
                                if (isLast) {
                                    return isModal ? (
                                        <PaginationItem key={index}>
                                            <Button
                                                variant="ghost"
                                                onClick={() =>
                                                    handleModalNavigation(
                                                        link.url || '',
                                                    )
                                                }
                                                disabled={!link.url}
                                                className="gap-1 pr-2.5"
                                            >
                                                <span>Next</span>
                                                <LuChevronRight className="h-4 w-4" />
                                            </Button>
                                        </PaginationItem>
                                    ) : (
                                        <PaginationItem key={index}>
                                            <Link
                                                href={link.url || '#'}
                                                className={clsx(
                                                    buttonVariants({
                                                        variant: 'ghost',
                                                    }),
                                                    'gap-1 pr-2.5', // Style from shadcn
                                                    !link.url &&
                                                        'pointer-events-none text-muted-foreground',
                                                )}
                                            >
                                                <span>Next</span>
                                                <LuChevronRight className="h-4 w-4" />
                                            </Link>
                                        </PaginationItem>
                                    );
                                }

                                // Handle Ellipsis
                                if (isEllipsis) {
                                    return (
                                        <PaginationItem key={index}>
                                            <PaginationEllipsis />
                                        </PaginationItem>
                                    );
                                }

                                // Handle numbered page links
                                return (
                                    <PaginationItem key={index}>
                                        {isModal ? (
                                            <Button
                                                onClick={() =>
                                                    handleModalNavigation(
                                                        link.url || '',
                                                    )
                                                }
                                                variant={
                                                    link.active
                                                        ? 'outline'
                                                        : 'ghost'
                                                }
                                                size="icon"
                                                disabled={!link.url}
                                                dangerouslySetInnerHTML={{
                                                    __html: link.label,
                                                }}
                                            />
                                        ) : (
                                            <Link
                                                href={link.url || '#'}
                                                className={clsx(
                                                    buttonVariants({
                                                        variant: link.active
                                                            ? 'outline'
                                                            : 'ghost',
                                                        size: 'icon',
                                                    }),
                                                )}
                                                dangerouslySetInnerHTML={{
                                                    __html: link.label,
                                                }}
                                            />
                                        )}
                                    </PaginationItem>
                                );
                            })}
                    </PaginationContent>
                </Pagination>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog
                open={!!mediaToDelete}
                onOpenChange={(open) => !open && setMediaToDelete(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete the image "{mediaToDelete?.title}" from the
                            server.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className={`${buttonVariants({
                                variant: 'destructive',
                            })} text-white`}
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );

    if (isModal) {
        return <MediaContent />;
    }

    return (
        <DashboardLayout>
            <MediaContent />
        </DashboardLayout>
    );
};

export default MediaComponent;
