import CartSync from '@/components/CartSync';
import PublicLayout from '@/layouts/public-layout';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { HeroUIProvider } from '@heroui/react';
import { initializeTheme } from './hooks/use-appearance';
import '../css/app.css';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: async (name) => {
        const page = await resolvePageComponent<any>(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx'));

        // Apply the public layout to all pages that don't have a layout defined and are not auth, settings, or dashboard pages.
        if (page.default.layout === undefined && !name.startsWith('auth/') && !name.startsWith('settings/') && name !== 'dashboard') {
            page.default.layout = (p: ReactNode) => <PublicLayout>{p}</PublicLayout>;
        }

        return page;
    },
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <HeroUIProvider>
                <App
                    {...props}
                    children={({ Component, key, props: pageProps }) => {
                        const getLayout = (Component as any).layout || ((page: ReactNode) => page);
                        const page = <Component {...pageProps} key={key} />;

                        return (
                            <>
                                <CartSync /> {getLayout(page)}
                            </>
                        );
                    }}
                />
            </HeroUIProvider>,
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
