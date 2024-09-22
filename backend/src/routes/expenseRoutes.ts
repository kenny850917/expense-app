import { Router } from 'express';
import upload from '../middlewares/fileUpload';
import { uploadCSV } from '../controllers/expenseController';

const router = Router();

// Route to handle CSV upload
router.post('/upload-csv', (req, res, next) => {
  console.log('CSV Upload route hit');
  next();
}, upload.single('file'), uploadCSV);

export default router;
