/**
 * GOOGLE DRIVE UPLOAD PROXY
 *
 * INSTRUCTIONS:
 * 1. Go to https://script.google.com/
 * 2. Click "New Project" and paste this code.
 * 3. Replace 'YOUR_ROOT_FOLDER_ID' with the ID of your Drive root upload folder.
 * 4. Click "Deploy" > "New Deployment".
 * 5. Select "Web App".
 * 6. Set "Execute as" to "Me" and "Who has access" to "Anyone".
 * 7. Copy the "Web App URL" and paste it into your app config.
 */

const ROOT_FOLDER_ID = 'YOUR_ROOT_FOLDER_ID'; // <--- PASTE YOUR ROOT FOLDER ID HERE

function safeSegment(segment) {
  return String(segment || '')
    .trim()
    .replace(/[\\/:*?"<>|]/g, '-')
    .replace(/\s+/g, ' ')
    .slice(0, 100);
}

function getOrCreateChildFolder(parent, name) {
  const safeName = safeSegment(name);
  const existing = parent.getFoldersByName(safeName);
  if (existing.hasNext()) return existing.next();
  return parent.createFolder(safeName);
}

function resolveTargetFolder(rootFolder, folderPath) {
  if (!folderPath) return rootFolder;
  const parts = String(folderPath)
    .split('/')
    .map(function (p) { return p.trim(); })
    .filter(function (p) { return p.length > 0; });

  let current = rootFolder;
  parts.forEach(function (part) {
    current = getOrCreateChildFolder(current, part);
  });
  return current;
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents || '{}');
    const fileContent = Utilities.base64Decode(data.base64 || '');
    const fileName = data.fileName || data.name || ('upload_' + Date.now());
    const contentType = data.contentType || data.mimeType || 'application/octet-stream';
    const folderPath = data.folderPath || '';
    const metadata = data.metadata || {};
    const createSidecarJson = data.createSidecarJson === true;

    const root = DriveApp.getFolderById(ROOT_FOLDER_ID);
    const targetFolder = resolveTargetFolder(root, folderPath);
    const blob = Utilities.newBlob(fileContent, contentType, fileName);
    const file = targetFolder.createFile(blob);

    // Set file to be publicly viewable so the TV display can show it
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    // Store optional metadata in description for audit/debugging
    try {
      const metaText = JSON.stringify(metadata);
      if (metaText && metaText !== '{}') file.setDescription(metaText);
    } catch (metaError) {
      // ignore metadata parsing failures
    }

    const result = {
      status: 'success',
      fileId: file.getId(),
      folderPath: folderPath,
      fileName: fileName,
      url: 'https://drive.google.com/uc?export=view&id=' + file.getId()
    };

    // Optional: create a sidecar JSON metadata file beside PDF uploads
    if (createSidecarJson) {
      const baseName = String(fileName).replace(/\.[^/.]+$/, '');
      const metaFileName = baseName + '.meta.json';
      const sidecarPayload = {
        fileId: file.getId(),
        fileName: fileName,
        fileUrl: result.url,
        folderPath: folderPath,
        metadata: metadata,
        generatedAt: new Date().toISOString()
      };
      targetFolder.createFile(
        Utilities.newBlob(
          JSON.stringify(sidecarPayload, null, 2),
          'application/json',
          metaFileName
        )
      );
      result.metaFileName = metaFileName;
    }

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
