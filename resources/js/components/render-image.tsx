type Props = {
    src: string;
    alt: string;
    width: string;
    height: string;
    className?: string;
};

const ImageRender = ({ src, alt, width, height, className }: Props) => {
    const imagePath = `storage/${src}`;
    return <img className={className} src={imagePath} alt={alt} style={{ width: width, height: height }} />;
};

export default ImageRender;
