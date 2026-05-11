export const isPdfUrl = (url: string) => {
    const u = url.toLowerCase();
    return (
        u.includes('.pdf') ||
        u.includes('/raw/upload/') ||
        u.includes('mime=application/pdf') ||
        u.includes('content-type=application/pdf') ||
        u.includes('export=download')
    );
};

export function toDisplayImageUrl(url: string): string {
    if (url.includes('res.cloudinary.com')) {
        if (isPdfUrl(url)) {
            return url
                .replace('/raw/upload/', '/image/upload/')
                .replace('/image/upload/', '/image/upload/f_jpg,pg_1/');
        }
        return url;
    }

    const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]{20,})/) ||
        url.match(/\/d\/([a-zA-Z0-9_-]{20,})/);
    if (idMatch) {
        return `https://drive.google.com/thumbnail?id=${idMatch[1]}&sz=w1920`;
    }

    return url;
}
