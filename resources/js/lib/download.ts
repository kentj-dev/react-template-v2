/**
 * Downloads a file from a given URL and filename.
 * @param url - The public file URL (e.g. `/storage/acknowledgements/xxx.pdf`)
 * @param filename - The filename for the downloaded file
 */
export async function downloadFile(url: string, filename: string) {
    const response = await fetch(url, { method: 'GET' });
    if (!response.ok) throw new Error('Failed to fetch file');

    const blob = await response.blob();
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
