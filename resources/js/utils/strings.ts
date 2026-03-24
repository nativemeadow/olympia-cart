export function formatText(text: string) {
    // Replace hyphens with spaces
    text = text.replace(/-/g, ' ');

    // Insert a space before all caps
    text = text.replace(/([A-Z])/g, ' $1').trim();

    // Capitalize the first character of each word
    text = text.replace(/\b\w/g, function (letter) {
        return letter.toUpperCase();
    });

    return text;
}

export function formatBytes(bytes: number, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export const generateSlug = (title: string): string => {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // remove non-alphanumeric characters except spaces and hyphens
        .replace(/\s+/g, '-') // replace spaces with hyphens
        .replace(/-+/g, '-'); // remove consecutive hyphens
};
