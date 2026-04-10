import PublicHeader from '@/components/public-header';
import { useBreadcrumbsFromPath } from '@/hooks/useBreadcrumbsFromPath';
import useMediaQuery from '@/hooks/use-media-query';
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

    const [open, setOpen] = useState(false);
    const isDesktop = useMediaQuery('(min-width: 768px)');
    const isTabletOrMobile = useMediaQuery('(max-width: 767px)');
    const isMobile = useMediaQuery('(max-width: 480px)');

    return (
        <div className={classes.page_container}>
            <CartSync />
            <header className={classes.header}>
                <nav className={classes['top-nav']}>
                    {user && user.is_guest === false ? (
                        <UserNav />
                    ) : user && user.is_guest === true ? (
                        <Link
                            href={route('registration.complete')}
                            className={classes['auth-link']}
                        >
                            Complete Registration
                        </Link>
                    ) : (
                        <>
                            <Link
                                href={route('login')}
                                className={classes['auth-link']}
                            >
                                Log in
                            </Link>
                            <Link
                                href={route('register')}
                                className={classes['auth-button']}
                            >
                                Register
                            </Link>
                        </>
                    )}
                </nav>
                <div
                    className={`${classes.site_menu} ${classes.site_navigation}`}
                >
                    {isDesktop && (
                        <div className={classes['desktop-menu']}>
                            <Link href="/categories">
                                <OMG_Logo className="logo" />
                            </Link>
                            <NavLinks />
                            <SearchProducts />
                            <div className="ml-auto">
                                <CartLink />
                            </div>
                        </div>
                    )}
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
