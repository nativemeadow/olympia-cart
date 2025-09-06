import { Link } from '@inertiajs/react';
import { MainNavData, NavData } from './NavLinksData';

const NavLinks = () => {
    return (
        <div className="flex items-center space-x-6">
            {MainNavData().map((item: NavData, index: number) => (
                <Link key={item.title} href={item.route} className="text-sm font-semibold text-[#FFF] active:text-[#e6b2b5] dark:text-[#e6b2b5]">
                    {item.title}
                </Link>
            ))}
        </div>
    );
};

export default NavLinks;
