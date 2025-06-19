const path = require('path');
const fs = require('fs').promises;

/**
 * Handles file upload and moves it to the appropriate directory
 * @param {Object} file - The uploaded file object from multer
 * @param {string} [subDirectory=''] - Optional subdirectory within uploads
 * @returns {Promise<string>} The file path relative to uploads directory
 */
async function uploadFile(file, subDirectory = '') {
  try {
    if (!file) throw new Error('No file provided');

    // Create a unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = `${uniqueSuffix}-${file.originalname}`;
    
    // Construct the upload path
    const uploadDir = path.join('uploads', subDirectory);
    const uploadPath = path.join(uploadDir, filename);

    // Ensure upload directory exists
    await fs.mkdir(uploadDir, { recursive: true });

    // Move the file from temp location to final destination
    await fs.rename(file.path, uploadPath);

    // Return the file path relative to uploads directory
    return `/${path.join(subDirectory, filename)}`;
  } catch (error) {
    // If anything goes wrong, attempt to clean up the temp file
    try {
      if (file.path && await fs.access(file.path)) {
        await fs.unlink(file.path);
      }
    } catch (cleanupError) {
      console.error('Error cleaning up temp file:', cleanupError);
    }

    throw new Error(`File upload failed: ${error.message}`);
  }
}

module.exports = uploadFile;