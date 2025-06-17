export function truncateText(str: string, max = 75) {
    if (!str) return '';
    return str.length > max ? str.slice(0, max) + '...' : str;
}
