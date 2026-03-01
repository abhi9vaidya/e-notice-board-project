/**
 * GOOGLE DRIVE UPLOAD PROXY
 * 
 * INSTRUCTIONS:
 * 1. Go to https://script.google.com/
 * 2. Click "New Project" and paste this code.
 * 3. Replace 'YOUR_FOLDER_ID' with the ID of a folder in your Google Drive.
 * 4. Click "Deploy" > "New Deployment".
 * 5. Select "Web App".
 * 6. Set "Execute as" to "Me" and "Who has access" to "Anyone".
 * 7. Copy the "Web App URL" and paste it into your .env file as VITE_GOOGLE_DRIVE_PROXY_URL.
 */

const FOLDER_ID = 'YOUR_FOLDER_ID'; // <--- PASTE YOUR FOLDER ID HERE

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const fileContent = Utilities.base64Decode(data.base64);
    const fileName = data.fileName;
    const contentType = data.contentType;
    
    const folder = DriveApp.getFolderById(FOLDER_ID);
    const file = folder.createFile(Utilities.newBlob(fileContent, contentType, fileName));
    
    // Set file to be publicly viewable so the TV display can show it
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    const result = {
      status: 'success',
      fileId: file.getId(),
      url: 'https://drive.google.com/uc?export=view&id=' + file.getId()  // embeddable in <img> tags
    };
    
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
