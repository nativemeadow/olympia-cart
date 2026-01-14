import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren, ReactNode } from 'react';
import {
    Package,
    Home,
    ShoppingCart,
    Users,
    Settings,
    LayoutGrid,
} from 'lucide-react';
import { User } from '@/types';
import { UserNav } from '@/components/user-nav';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

const navItems = [
    { href: 'dashboard', label: 'Dashboard', icon: Home },
    { href: 'dashboard.categories', label: 'Categories', icon: LayoutGrid },
    { href: 'dashboard.products', label: 'Products', icon: Package },
    { href: 'dashboard.orders', label: 'Orders', icon: ShoppingCart },
    { href: 'dashboard.customers', label: 'Customers', icon: Users },
    { href: 'dashboard.users', label: 'Admin Users', icon: Users },
    { href: 'dashboard.settings', label: 'Settings', icon: Settings },
];

const NavLink = ({ href, children }: { href: string; children: ReactNode }) => (
    <Link
        preserveState
        href={route(href)}
        className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
    >
        {children}
    </Link>
);

export default function DashboardLayout({ children }: PropsWithChildren) {
    const { auth } = usePage<{ auth: { user: User } }>().props;

    const navigationLinks = navItems.map((item) => (
        <NavLink key={item.href} href={item.href}>
            <item.icon className="h-4 w-4" />
            {item.label}
        </NavLink>
    ));

    return (
        <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
            <div className="hidden border-r bg-muted/40 md:block">
                <div className="flex h-full max-h-screen flex-col gap-2">
                    <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                        <Link
                            href="/"
                            className="flex items-center gap-2 font-semibold"
                        >
                            <Package className="h-6 w-6" />
                            <span className="">Olympia Garden</span>
                        </Link>
                    </div>
                    <div className="flex-1">
                        <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                            {navigationLinks}
                        </nav>
                    </div>
                </div>
            </div>
            <div className="flex flex-col">
                <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                className="shrink-0 md:hidden"
                            >
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">
                                    Toggle navigation menu
                                </span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="flex flex-col">
                            <nav className="grid gap-2 text-lg font-medium">
                                {navigationLinks}
                            </nav>
                        </SheetContent>
                    </Sheet>
                    <div className="w-full flex-1">
                        {/* Optional: Add a global search bar here */}
                    </div>
                    <UserNav />
                </header>
                <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
