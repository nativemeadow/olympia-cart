import PublicHeader from '@/components/public-header';
import { useBreadcrumbsFromPath } from '@/hooks/useBreadcrumbsFromPath';
import OMG_Logo from '@/layouts/OGM_Logo';
import { type SharedData } from '@/types';
import { UserNav } from '@/components/user-nav';
import { Link, usePage } from '@inertiajs/react';
import { ReactNode, useState } from 'react';
import NavLinks from './NavLinks';
import CartLink from './CartLink';
import Footer from './Footer';
import PageTransition from '@/components/page-transition';
import { User } from '@/types';
import SearchProducts from './SearchProducts';
import cx from 'clsx';
import CartSync from '@/components/CartSync';

import classes from './public-layout.module.css';

type PublicLayoutProps = {
    children: ReactNode;
};

export default function PublicLayout({ children }: PublicLayoutProps) {
    const { auth, cart } = usePage<SharedData>().props;
    const breadcrumbs = useBreadcrumbsFromPath();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const user = auth.user as User | null;

    return (
        <div className={classes.page_container}>
            <CartSync />
            <header
                className={cx(
                    'sticky top-0 z-10 w-full bg-[#FDFDFC] text-sm text-[#1b1b18] not-has-[nav]:hidden lg:justify-center dark:bg-[#0a0a0a] dark:text-[#EDEDEC]',
                    classes.header,
                )}
            >
                <nav className="mr-1.5 flex h-12 items-center justify-end gap-4">
                    {user && user.is_guest === false ? (
                        <UserNav />
                    ) : user && user.is_guest === true ? (
                        <Link
                            href={route('registration.complete')}
                            className="inline-block rounded-sm border border-transparent px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#19140035] dark:text-[#EDEDEC] dark:hover:border-[#3E3E3A]"
                        >
                            Complete Registration
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
                <div className="site_menu flex h-[64px] w-full items-center bg-[#1914001a] px-4 text-[#1b1b18] dark:bg-[#3E3E3A] dark:text-[#fff]">
                    <Link href="/categories">
                        <OMG_Logo className="logo" />
                    </Link>
                    <NavLinks />
                    <SearchProducts />
                    <div className="ml-auto">
                        <CartLink />
                    </div>
                </div>
                <nav>
                    <PublicHeader
                        breadcrumbs={breadcrumbs.map((b) => ({
                            ...b,
                            href: b.href ?? '',
                        }))}
                    />
                </nav>
            </header>
            <main
                id="main-content"
                className={
                    cx(
                        'main page-container items-center p-6 lg:justify-center lg:p-2',
                    ) +
                    ' ' +
                    classes['main-content']
                }
            >
                <PageTransition>{children}</PageTransition>
            </main>
            <Footer cssClass={classes.footer} />
        </div>
    );
}
