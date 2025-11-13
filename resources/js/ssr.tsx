import CartSync from '@/components/CartSync';
import CheckoutSync from '@/components/CheckoutSync';
import PublicLayout from '@/layouts/public-layout';
import { createInertiaApp } from '@inertiajs/react';
import createServer from '@inertiajs/react/server';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { ReactNode } from 'react';
import ReactDOMServer from 'react-dom/server';
import { type RouteName, route } from 'ziggy-js';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createServer((page) =>
    createInertiaApp({
        page,
        render: ReactDOMServer.renderToString,
        title: (title) => (title ? `${title} - ${appName}` : appName),
        resolve: async (name) => {
            const page = await resolvePageComponent<any>(
                `./pages/${name}.tsx`,
                import.meta.glob('./pages/**/*.tsx'),
            );

            // Apply the public layout to all pages that don't have a layout defined and are not auth, settings, or dashboard pages.
            if (
                page.default.layout === undefined &&
                !name.startsWith('auth/') &&
                !name.startsWith('settings/') &&
                name !== 'dashboard'
            ) {
                page.default.layout = (p: ReactNode) => (
                    <PublicLayout>{p}</PublicLayout>
                );
            }

            return page;
        },
        setup: ({ App, props }) => {
            /* eslint-disable */
            // @ts-expect-error
            global.route<RouteName> = (name, params, absolute) =>
                route(name, params as any, absolute, {
                    // @ts-expect-error
                    ...page.props.ziggy,
                    // @ts-expect-error
                    location: new URL(page.props.ziggy.location),
                });
            /* eslint-enable */

            return (
                <App
                    {...props}
                    children={({ Component, key, props: pageProps }) => {
                        const getLayout =
                            (Component as any).layout ||
                            ((page: ReactNode) => page);
                        const page = <Component {...pageProps} key={key} />;

                        return (
                            <>
                                <CartSync />
                                <CheckoutSync />
                                {getLayout(page)}
                            </>
                        );
                    }}
                />
            );
        },
    }),
);
