import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import multer from 'multer';
import transactionRouter from './routes/transaction.routes';
import { protectWithApiKey } from './middleware/auth.middleware';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', protectWithApiKey, transactionRouter);

app.use((err: any, req: Request, res: Response, next: NextFunction): void => {
	if (err.code === 'LIMIT_FILE_SIZE') {
		res.status(413).json({ message: `File too large. Maximum size is 5MB.` });
		return;
	}

	if (err instanceof multer.MulterError) {
		res.status(400).json({ message: `File upload error: ${err.message}` });
		return;
	}

	next(err);
});

export { app };
