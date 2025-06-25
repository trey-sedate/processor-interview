import { Request, Response } from 'express';
import * as TransactionService from '../services/transaction.service';

export const processTransactions = async (req: Request, res: Response): Promise<void> => {
	try {
		const file = req.file;
		if (!file) {
			res.status(400).json({ message: 'No file uploaded.'});
			return;
		}

		const result = await TransactionService.processUploadedFile(file);

		res.status(200).json({ 
				message: 'File processed successfully.',
				...result
		});
	} catch (error) {
		if (error instanceof Error) {
			console.error("Error processing files:", error.message);
			res.status(500).json({ message: 'Failed to process transaction files.', error: error.message });
		} else {
			console.error("Unknown error processing files:", error);
			res.status(500).json({ message: 'Failed to process transaction files.', error: 'Unknown error occurred.' });
		}
	}
};

export const resetDatabase = async (req: Request, res: Response): Promise<void> => {
	try {
			await TransactionService.resetData();
			res.status(200).json({ message: 'Database reset successfully.' });
	} catch (error) {
			res.status(500).json({ message: 'Failed to reset database.', error: (error as Error).message });
	}
};