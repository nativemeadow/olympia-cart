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
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { clsx } from 'clsx';
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu';
import { Input } from '@/components/ui/input';
import UploadNewImage from './create';
import UpdateImage from './update';

type MediaProps = {
    media: Paginated<Media>;
    filters: {
        sort_column: string;
        order: string;
        per_page: string;
        search_term: string;
    };
};

const MediaComponent = ({ media, filters }: MediaProps & PageProps) => {
    const { data, links, meta } = media;

    console.log('Media data:', data);
    console.log('Media links:', links);
    console.log('Media meta:', meta);
    console.log('filters:', filters);

    const handlePerPageChange = (per_page: string) => {
        router.get(
            route('dashboard.media'),
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
        router.get(
            route('dashboard.media'),
            { ...filters, sort_column, order },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const search_term = e.target.value;
        router.get(
            route('dashboard.media'),
            { ...filters, search_term },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    return (
        <DashboardLayout>
            <Head title="Media" />
            <h1 className="text-lg font-semibold md:text-2xl">Manage Media</h1>
            <div className="flex items-center justify-between gap-2">
                <p className="text-sm text-muted-foreground">
                    This is where you will manage your media library and upload
                    new images.
                </p>
                <UploadNewImage />
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
                            <SelectItem value="created_at_desc">
                                Newest First
                            </SelectItem>
                            <SelectItem value="created_at_asc">
                                Oldest First
                            </SelectItem>
                            <SelectItem value="title_asc">Title A-Z</SelectItem>
                            <SelectItem value="title_desc">
                                Title Z-A
                            </SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {data.map((image) => (
                    <div
                        key={image.id}
                        className="flex flex-col items-center gap-2"
                    >
                        <figure
                            key={image.id}
                            className="group relative aspect-square overflow-hidden rounded-md border"
                        >
                            <img
                                src={image.url + '/' + image.file_name}
                                alt={image.alt_text || image.title}
                                title={image.title}
                                className="h-full w-full object-cover transition-all group-hover:brightness-75"
                            />
                            <figcaption className="absolute inset-0 flex items-center justify-center bg-white/50 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-50">
                                <p className="text-center text-sm font-semibold text-gray-800">
                                    {image.title}
                                </p>
                            </figcaption>
                        </figure>
                        <div className="text-sm text-muted-foreground">
                            {image.title} Uploaded on{' '}
                            {new Date(image.created_at).toLocaleDateString()}
                            <br />
                            {image.type && ` | Type: ${image.type}`}
                            <br />
                            <UpdateImage media={image} />
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
                                    return (
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
                                    return (
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
                                    </PaginationItem>
                                );
                            })}
                    </PaginationContent>
                </Pagination>
            </div>
        </DashboardLayout>
    );
};

export default MediaComponent;
