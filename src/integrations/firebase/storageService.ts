import { storage } from './config';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

/**
 * Upload a file to Firebase Storage and return its public download URL.
 * Files are stored under notices/images/<timestamp>_<filename>.
 */
export const uploadNoticeFile = (
    file: File,
    onProgress?: (pct: number) => void
): Promise<string> => {
    return new Promise((resolve, reject) => {
        const ext = file.name.split('.').pop() ?? 'bin';
        const path = `notices/images/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
        const storageRef = ref(storage, path);
        const task = uploadBytesResumable(storageRef, file, { contentType: file.type });

        task.on(
            'state_changed',
            (snap) => {
                if (onProgress) {
                    onProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100));
                }
            },
            (err) => reject(err),
            async () => {
                const url = await getDownloadURL(task.snapshot.ref);
                resolve(url);
            }
        );
    });
};
