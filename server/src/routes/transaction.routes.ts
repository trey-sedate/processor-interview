import { Router } from 'express';
import multer from 'multer';
import { processTransactions, resetDatabase } from '../controllers/transaction.controller';

// Configure multer for in-memory file storage
const storage = multer.memoryStorage();
const upload = multer({
	storage: storage,
	limits: {
		fileSize: 5 * 1024 * 1024, // 5 MB limit per file
	}
});

const router = Router();

router.post('/process-transactions', upload.single('transactionFile'), processTransactions);
router.delete('/reset', resetDatabase);

export default router;