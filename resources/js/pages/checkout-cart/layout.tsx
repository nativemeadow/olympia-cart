import CheckoutSteps from './checkout-steps';

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <CheckoutSteps />
            <div className="container mx-auto mt-8 px-4">{children}</div>
        </>
    );
}
