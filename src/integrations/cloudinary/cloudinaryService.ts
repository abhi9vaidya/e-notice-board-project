/**
 * Upload a file to Cloudinary using an unsigned upload preset.
 * Free tier: 25 GB storage, 25 GB bandwidth/month — no credit card needed.
 *
 * Setup (one-time, ~2 minutes):
 *  1. Create a free account at https://cloudinary.com
 *  2. Go to Settings → Upload → Upload presets → Add upload preset
 *  3. Set "Signing Mode" to "Unsigned" → Save
 *  4. Add to your .env:
 *       VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
 *       VITE_CLOUDINARY_UPLOAD_PRESET=your_preset_name
 */
export const uploadToCloudinary = (
    file: File,
    onProgress?: (pct: number) => void
): Promise<string> => {
    return new Promise((resolve, reject) => {
        const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

        if (!cloudName || !uploadPreset) {
            reject(new Error('Cloudinary is not configured. Add VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET to your .env file.'));
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', uploadPreset);
        formData.append('folder', 'rbu-notices');

        const xhr = new XMLHttpRequest();
        xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/upload`);

        xhr.upload.onprogress = (e) => {
            if (e.lengthComputable && onProgress) {
                onProgress(Math.round((e.loaded / e.total) * 100));
            }
        };

        xhr.onload = () => {
            if (xhr.status === 200) {
                const res = JSON.parse(xhr.responseText);
                resolve(res.secure_url);
            } else {
                reject(new Error(`Cloudinary upload failed: ${xhr.statusText}`));
            }
        };

        xhr.onerror = () => reject(new Error('Network error during upload.'));
        xhr.send(formData);
    });
};
