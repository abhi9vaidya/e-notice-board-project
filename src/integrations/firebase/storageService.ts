// ── Google Drive Upload Service ────────────────────────────────────────────────
// Replaces Firebase Storage. Uploads files directly to a Google Drive folder via
// the Google Apps Script Web App Bridge.

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxqLNjNbIr8bqV0GJhmBmO9j_8_5m-j5nrjX6CtHSfajvS9l26n_p1PXR4SmfTfSOn8/exec";

/**
 * Upload a file to Google Drive and return its direct viewable URL.
 */
export const uploadNoticeFile = (
    file: File,
    onProgress?: (pct: number) => void
): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        // Start reading file as base64
        reader.readAsDataURL(file);

        reader.onload = async () => {
            try {
                if (onProgress) onProgress(20); // Base64 encoding complete

                const base64String = reader.result as string;
                // Remove the "data:image/png;base64," prefix
                const base64 = base64String.split(',')[1];

                if (onProgress) onProgress(50); // Starting upload

                // Send POST request to Apps Script
                const response = await fetch(SCRIPT_URL, {
                    method: "POST",
                    // Use text/plain to avoid aggressive CORS preflight issues with Google Apps Script
                    headers: { 'Content-Type': 'text/plain' },
                    body: JSON.stringify({
                        name: file.name,
                        mimeType: file.type,
                        base64: base64
                    }),
                });

                if (onProgress) onProgress(90); // Received response

                const result = await response.json();

                if (result.success) {
                    if (onProgress) onProgress(100);
                    // Convert Drive URL into a direct inline-viewable URL for <img src="...">
                    const directUrl = `https://drive.google.com/uc?export=view&id=${result.id}`;
                    resolve(directUrl);
                } else {
                    reject(new Error(result.error || "Upload failed"));
                }
            } catch (err) {
                reject(err);
            }
        };

        reader.onerror = (error) => {
            reject(error);
        };
    });
};
