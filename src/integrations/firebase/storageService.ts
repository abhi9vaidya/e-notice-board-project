// ── Google Drive Upload Service ────────────────────────────────────────────────
// Replaces Firebase Storage. Uploads files directly to a Google Drive folder via
// the Google Apps Script Web App Bridge.

const SCRIPT_URL =
    import.meta.env.VITE_GOOGLE_DRIVE_PROXY_URL ||
    "https://script.google.com/macros/s/AKfycbyCBjXIVAiYpsJcq4M806gaLNnu_L_K6v1AzU8n36GmIkORJxMWsFWz1pZLdOzEGx4C/exec";

export interface UploadNoticeFileOptions {
    category?: string;
    facultyId?: string;
    facultyName?: string;
    noticeTitle?: string;
    startTime?: Date;
    endTime?: Date;
}

const sanitizeSegment = (input: string) =>
    input
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9._-]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

const getFileExtension = (file: File) => {
    const dot = file.name.lastIndexOf('.');
    if (dot !== -1 && dot < file.name.length - 1) return file.name.slice(dot + 1).toLowerCase();
    if (file.type === 'application/pdf') return 'pdf';
    if (file.type === 'image/jpeg') return 'jpg';
    if (file.type === 'image/png') return 'png';
    if (file.type === 'image/gif') return 'gif';
    return 'bin';
};

const formatTimestamp = (date: Date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    const ss = String(date.getSeconds()).padStart(2, '0');
    return `${yyyy}${mm}${dd}_${hh}${min}${ss}`;
};

/**
 * Upload a file to Google Drive and return its direct viewable URL.
 */
export const uploadNoticeFile = (
    file: File,
    onProgress?: (pct: number) => void,
    options?: UploadNoticeFileOptions
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
                const now = new Date();
                const year = String(now.getFullYear());
                const month = String(now.getMonth() + 1).padStart(2, '0');
                const fileType = file.type === 'application/pdf' ? 'pdf' : 'image';
                const category = sanitizeSegment(options?.category || 'uncategorized');
                const faculty = sanitizeSegment(options?.facultyName || options?.facultyId || 'unknown-faculty');
                const title = sanitizeSegment(options?.noticeTitle || file.name.replace(/\.[^/.]+$/, '')) || 'notice';
                const extension = getFileExtension(file);
                const timestamp = formatTimestamp(now);
                const generatedName = `${timestamp}__${category}__${faculty}__${title}.${extension}`;
                const folderPath = `notices/${year}/${month}/${category}/${fileType}`;

                if (onProgress) onProgress(50); // Starting upload

                // Send POST request to Apps Script
                const response = await fetch(SCRIPT_URL, {
                    method: "POST",
                    // Use text/plain to avoid aggressive CORS preflight issues with Google Apps Script
                    headers: { 'Content-Type': 'text/plain' },
                    body: JSON.stringify({
                        name: generatedName,
                        fileName: generatedName,
                        mimeType: file.type,
                        contentType: file.type,
                        base64: base64,
                        folderPath,
                        metadata: {
                            folderSchemeVersion: 'v2',
                            uploadedAt: now.toISOString(),
                            originalName: file.name,
                            generatedName,
                            fileType,
                            category: options?.category || 'uncategorized',
                            facultyId: options?.facultyId || '',
                            facultyName: options?.facultyName || '',
                            noticeTitle: options?.noticeTitle || '',
                            startTime: options?.startTime ? options.startTime.toISOString() : '',
                            endTime: options?.endTime ? options.endTime.toISOString() : '',
                        },
                        createSidecarJson: fileType === 'pdf',
                    }),
                });

                if (onProgress) onProgress(90); // Received response

                const raw = await response.text();
                let result: any = {};
                try {
                    result = raw ? JSON.parse(raw) : {};
                } catch {
                    throw new Error(`Drive proxy returned non-JSON response (HTTP ${response.status}).`);
                }

                const isSuccess = result.success === true || result.status === 'success';
                if (isSuccess) {
                    if (onProgress) onProgress(100);
                    // Support both old and new Apps Script response shapes
                    const fileId = result.id || result.fileId;
                    const directUrl = result.url || (fileId ? `https://drive.google.com/uc?export=view&id=${fileId}` : '');
                    if (!directUrl) {
                        throw new Error('Upload succeeded but no file URL was returned by Drive proxy.');
                    }
                    resolve(directUrl);
                } else {
                    const detail =
                        result.error ||
                        result.message ||
                        (response.ok ? '' : `HTTP ${response.status}`);
                    reject(new Error(detail ? `Upload failed: ${detail}` : "Upload failed"));
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
