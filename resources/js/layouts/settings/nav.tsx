import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { type NavItem } from '@/types';

const sidebarNavItems: NavItem[] = [
    { title: 'Profile', href: 'profile' },
    { title: 'Address', href: 'address' },
    { title: 'Orders', href: 'orders' },
    { title: 'Password', href: 'password' },
    { title: 'Appearance', href: 'appearance' },
];

type SettingsNavProps = {
    activeTab: string;
    setActiveTab: (tab: string) => void;
};

export default function SettingsNav({
    activeTab,
    setActiveTab,
}: SettingsNavProps) {
    return (
        <nav className="flex flex-col space-y-1 space-x-0">
            {sidebarNavItems.map((item) => (
                <Button
                    key={item.href}
                    size="sm"
                    variant="ghost"
                    onClick={() => setActiveTab(item.href)}
                    className={cn('w-full justify-start', {
                        'bg-muted': activeTab === item.href,
                    })}
                >
                    {item.title}
                </Button>
            ))}
        </nav>
    );
}
