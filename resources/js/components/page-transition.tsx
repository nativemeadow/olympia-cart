import { router } from '@inertiajs/react';
import { ReactNode, useEffect, useRef } from 'react';

type PageTransitionProps = {
    children: ReactNode;
};

export default function PageTransition({ children }: PageTransitionProps) {
    console.log('PageTransition rendered');
    const pageWrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const pageWrapper = pageWrapperRef.current;
        if (!pageWrapper) {
            return;
        }

        const handleStart = (event: any) => {
            // Don't apply transition on partial reloads
            if (event.detail.visit.only.length > 0) {
                return;
            }
            if (pageWrapperRef.current) {
                pageWrapperRef.current.classList.add(
                    'opacity-0',
                    'translate-y-4',
                );
            }
        };

        const handleFinish = () => {
            if (pageWrapperRef.current) {
                // Use a timeout to ensure the browser has a chance to apply the
                // 'opacity-0' class before we remove it, making the transition reliable.
                setTimeout(
                    () =>
                        pageWrapperRef.current?.classList.remove(
                            'opacity-0',
                            'translate-y-4',
                        ),
                    10,
                );
            }
        };

        // Initial page load fade-in
        handleFinish();

        const removeStartListener = router.on('start', handleStart);
        const removeFinishListener = router.on('finish', handleFinish);

        return () => {
            removeStartListener();
            removeFinishListener();
        };
    }, []);

    return (
        <div
            ref={pageWrapperRef}
            className="page-wrapper w-full translate-y-4 opacity-0"
        >
            {children}
        </div>
    );
}
