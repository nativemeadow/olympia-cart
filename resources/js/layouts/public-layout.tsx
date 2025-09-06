import PublicHeader from '@/components/public-header';
import { useBreadcrumbsFromPath } from '@/hooks/useBreadcrumbsFromPath';
import OMG_Logo from '@/layouts/OGM_Logo';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ReactNode } from 'react';
import NavLinks from './NavLinks';
import Footer from './Footer';

type PublicLayoutProps = {
    children: ReactNode;
};

export default function PublicLayout({ children }: PublicLayoutProps) {
    const { auth } = usePage<SharedData>().props;
    const breadcrumbs = useBreadcrumbsFromPath();

    return (
        <>
            <div className="w-full bg-[#FDFDFC] text-[#1b1b18] lg:justify-center dark:bg-[#0a0a0a]">
                <header className="w-full text-sm not-has-[nav]:hidden">
                    <nav className="mr-1.5 flex h-12 items-center justify-end gap-4">
                        {auth.user ? (
                            <Link
                                href={route('dashboard')}
                                className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={route('login')}
                                    className="inline-block rounded-sm border border-transparent px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#19140035] dark:text-[#EDEDEC] dark:hover:border-[#3E3E3A]"
                                >
                                    Log in
                                </Link>
                                <Link
                                    href={route('register')}
                                    className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </nav>
                    <div className="site_menu my-4 flex h-[64px] w-full items-center justify-start bg-[#1914001a] px-4 text-[#1b1b18] dark:bg-[#3E3E3A] dark:text-[#fff]">
                        <Link href="/">
                            <OMG_Logo className="logo" />
                        </Link>
                        <NavLinks />
                    </div>
                    <nav>
                        <PublicHeader breadcrumbs={breadcrumbs.map((b) => ({ ...b, href: b.href ?? '' }))} />
                    </nav>
                </header>
            </div>
            <div className="flex min-h-screen flex-col items-center bg-[#FDFDFC] p-6 text-[#1b1b18] lg:justify-center lg:p-2 dark:bg-[#0a0a0a]">
                <main className="flex w-full justify-center opacity-100 transition-opacity duration-750 lg:grow starting:opacity-0">
                    <div className="w-full max-w-4xl">{children}</div>
                </main>
                <div className="hidden h-14.5 lg:block"></div>
            </div>
            <Footer />
        </>
    );
}
