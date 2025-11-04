import { Link } from '@inertiajs/react';
import { MainNavData, NavData } from './NavLinksData';
import { usePage } from '@inertiajs/react';

import classes from './NavLinks.module.css';

const NavLinks = () => {
    const { url } = usePage();
    const path = typeof url === 'string' ? url : window.location.pathname;

    console.log('Current path:', path);

    const isActive = (item: NavData) => {
        let isActive = false;

        if (path.includes(item.route)) {
            isActive = true;
        }
        return isActive;
    };

    return (
        <div
            className={`flex items-center space-x-6 ${classes['main-nav-item']}`}
        >
            {MainNavData().map((item: NavData, index: number) => (
                <Link
                    key={item.title}
                    href={item.route}
                    className={`text-sm font-semibold ${isActive(item) ? classes.active : ''}`}
                >
                    {item.title}
                </Link>
            ))}
        </div>
    );
};

export default NavLinks;
