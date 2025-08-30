import { Breadcrumbs } from '@/components/breadcrumbs';

type Breadcrumb = {
    title: string;
    href: string;
};

type PublicHeaderProps = {
    breadcrumbs?: Breadcrumb[];
};

const PublicHeader = ({ breadcrumbs = [] }: PublicHeaderProps) => {
    return (
        <>
            {breadcrumbs.length > 1 && (
                <div className="flex w-full border-b border-sidebar-border/70">
                    <div className="mx-auto flex h-12 w-full items-center justify-start px-4 text-neutral-500 md:max-w-7xl">
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    </div>
                </div>
            )}
        </>
    );
};

export default PublicHeader;
