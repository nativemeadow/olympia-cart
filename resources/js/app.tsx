import '../css/app.css';

import PublicLayout from '@/layouts/public-layout';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) => {
        const pagePromise = resolvePageComponent<any>(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx'));

        pagePromise.then((module) => {
            if (module.default.layout === undefined && name !== 'dashboard') {
                module.default.layout = (page: ReactNode) => <PublicLayout>{page}</PublicLayout>;
            }
        });
        return pagePromise;
    },
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(<App {...props} />);
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
