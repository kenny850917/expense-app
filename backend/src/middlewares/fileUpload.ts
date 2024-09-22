import multer from 'multer';
import path from 'path';

// Setup Multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log('Uploading file to destination...');
    cb(null, 'uploads/');  // Save uploaded files to the "uploads" folder
  },
  filename: function (req, file, cb) {
    console.log(`Received file: ${file.originalname}`);
    cb(null, `${Date.now()}-${path.basename(file.originalname)}`);
  }
});

// File upload middleware
const upload = multer({ storage });

export default upload;
