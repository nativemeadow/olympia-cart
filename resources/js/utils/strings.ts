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
