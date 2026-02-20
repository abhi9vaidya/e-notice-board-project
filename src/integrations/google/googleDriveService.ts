// upload files to google drive proxy

export interface DriveUploadResponse {
    status: 'success' | 'error';
    fileId?: string;
    url?: string;
    message?: string;
}

// upload file to drive
export const uploadToGoogleDrive = async (file: File): Promise<string> => {
    const proxyUrl = import.meta.env.VITE_GOOGLE_DRIVE_PROXY_URL;

    if (!proxyUrl) {
        throw new Error('Google Drive Proxy URL not configured in .env');
    }

    // convert to base64
    const base64 = await fileToBase64(file);

    const payload = {
        fileName: file.name,
        contentType: file.type,
        base64: base64.split(',')[1] // remove prefix
    };

    try {
        // send as simple request
        const resultResponse = await fetch(proxyUrl, {
            method: 'POST',
            body: JSON.stringify(payload),
        });

        // handle gas cors issues
        try {
            const result: DriveUploadResponse = await resultResponse.json();
            if (result.status === 'success' && result.url) {
                return result.url;
            }
            throw new Error(result.message || 'Drive proxy returned error status');
        } catch (e) {
            // If we can't read the response due to CORS, but the request was sent...
            // This is a common GAS limitation. 
            console.warn('Could not read response body due to CORS, but request was sent.');
            // We'll return a generic success if we think it went through, 
            // or just rethrow if it's a real network error
            if (resultResponse.type === 'opaque' || resultResponse.status === 200 || resultResponse.status === 0) {
                // We can't actually get the URL here if it's opaque.
                throw new Error('CORS restriction: File uploaded but URL could not be retrieved. Please check Drive.');
            }
            throw e;
        }
    } catch (error) {
        console.error('Google Drive Upload Error:', error);
        throw error;
    }
};

// convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};
