import { useState, useCallback } from 'react';

/**
 * A custom React hook to handle file input changes and generate an image preview.
 *
 * @returns An object containing:
 *  - `file`: The selected File object.
 *  - `previewSrc`: A data URL for the selected image, suitable for an <img> src attribute.
 *  - `handleFileChange`: A callback to be used as the onChange handler for a file input.
 *  - `clearFile`: A function to reset the file and preview.
 */
export function useImagePreview() {
    const [file, setFile] = useState<File | null>(null);
    const [previewSrc, setPreviewSrc] = useState<string | null>(null);

    const handleFileChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const selectedFile = event.target.files?.[0];

            if (selectedFile) {
                setFile(selectedFile);

                const reader = new FileReader();
                reader.onload = (e) => {
                    setPreviewSrc(e.target?.result as string);
                };
                reader.readAsDataURL(selectedFile);
            } else {
                setFile(null);
                setPreviewSrc(null);
            }
        },
        [], // No dependencies, the function is stable
    );

    const clearFile = useCallback(() => {
        setFile(null);
        setPreviewSrc(null);
    }, []);

    return {
        file,
        fileName: file?.name,
        fileSize: file?.size,
        previewSrc,
        handleFileChange,
        clearFile,
    };
}
