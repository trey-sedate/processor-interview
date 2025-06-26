import { Request, Response } from 'express';
import * as TransactionService from '../services/transaction.service';

export const processTransactions = async (req: Request, res: Response): Promise<void> => {
	try {
		const file = req.file;
		if (!file) {
			res.status(400).json({ message: 'No file uploaded.'});
			return;
		}

		const skipLuhn = req.body.skipLuhn === 'true';

		const result = await TransactionService.processUploadedFile(file, skipLuhn);

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
			console.log("Error resetting database:", (error as Error).message);
			res.status(500).json({ message: 'Failed to reset database.' });
	}
};

export const getRejectedTransactions = async (req: Request, res: Response): Promise<void> => {
	try {
			const rejected = await TransactionService.getRejected();
			res.status(200).json(rejected);
	} catch (error) {
			console.log("Error retrieving rejected transactions:", (error as Error).message);
			res.status(500).json({ message: 'Failed to retrieve rejected transactions.' });
	}
};

export const getSummaryByCardType = async (req: Request, res: Response): Promise<void> => {
	try {
			const summary = await TransactionService.getCardTypeSummary();
			res.status(200).json(summary);
	} catch (error) {
			console.log("Error retrieving summary by card type:", (error as Error).message);
			res.status(500).json({ message: 'Failed to retrieve summary by card type.' });
	}
};

export const getSummaryByDay = async (req: Request, res: Response): Promise<void> => {
	try {
			const summary = await TransactionService.getDailySummary();
			res.status(200).json(summary);
	} catch (error) {
			console.log("Error retrieving summary by day:", (error as Error).message);
			res.status(500).json({ message: 'Failed to retrieve summary by day.' });
	}
};

export const getSummaryByCard = async (req: Request, res: Response): Promise<void> => {
	try {
			const summary = await TransactionService.getCardSummary();
			res.status(200).json(summary);
	} catch (error) {
			console.log("Error retrieving summary by card:", (error as Error).message);
			res.status(500).json({ message: 'Failed to retrieve summary by card.' });
	}
};
