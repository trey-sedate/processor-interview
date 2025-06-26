import { Router } from 'express';
import multer from 'multer';
import {
	processTransactions,
	resetDatabase,
	getRejectedTransactions,
	getSummaryByCardType,
	getSummaryByDay,
	getSummaryByCard,
} from '../controllers/transaction.controller';

// Configure multer for in-memory file storage
const storage = multer.memoryStorage();
const upload = multer({
	storage: storage,
	limits: {
		fileSize: 5 * 1024 * 1024, // 5 MB limit per file
	},
});

const router = Router();

router.post(
	'/process-transactions',
	upload.single('transactionFile'),
	processTransactions,
);
router.delete('/reset', resetDatabase);
router.get('/reporting/rejected-transactions', getRejectedTransactions);
router.get('/reporting/summary-by-card-type', getSummaryByCardType);
router.get('/reporting/summary-by-day', getSummaryByDay);
router.get('/reporting/summary-by-card', getSummaryByCard);

export default router;
