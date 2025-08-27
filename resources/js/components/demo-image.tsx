import React from 'react';

interface DemoImagesProps {
    src?: string;
    alt?: string;
    className?: string;
    size?: number;
}

const DemoImages: React.FC<DemoImagesProps> = ({
    src = `https://picsum.photos/seed/${Math.floor(Math.random() * 100_001)}`,
    alt = 'Demo Image',
    className = '',
    size = 100,
}) => <img src={`${src}/${size}/${size}`} alt={alt} className={className} style={{ width: size, height: size }} />;

export default DemoImages;
