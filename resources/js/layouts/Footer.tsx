import React from 'react';

type FooterProps = {
    cssClass: string;
};

export default function Footer({ cssClass }: FooterProps) {
    return (
        <footer className={`{${cssClass}} footer`}>
            © {new Date().getFullYear()} Olympia Garden Materials. All rights
            reserved.
        </footer>
    );
}
