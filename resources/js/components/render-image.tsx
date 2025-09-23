type Props = {
    src: string;
    alt: string;
    className?: string;
};

const ImageRender = ({ src, alt, className }: Props) => {
    const imagePath = `${src}`;
    return <img className={className} src={imagePath} alt={alt} />;
};

export default ImageRender;
