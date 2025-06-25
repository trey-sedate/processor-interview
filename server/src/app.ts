import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import multer from 'multer';
import { PrismaClient, CardType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { Parser as XmlParser } from 'xml2js';
import { js2xml } from 'xml-js';

const app = express();
const prisma = new PrismaClient();
const xmlParser = new XmlParser({ explicitArray: false });

// Configure multer for in-memory file storage
const storage = multer.memoryStorage();
const upload = multer({
	storage: storage,
	limits: {
		fileSize: 5 * 1024 * 1024, // 5 MB limit per file
	}
});

app.use(cors());
app.use(express.json());

const protectWithApiKey = (req: Request, res: Response, next: NextFunction): void => {
	const apiKey = req.headers['x-api-key'];
	const serverApiKey = process.env.API_SECRET_KEY;

	if (!serverApiKey) {
		console.error("FATAL: API_SECRET_KEY is not set on the server.");
		res.status(500).json({ message: "Server configuration error." });
		return;
	}

	if (apiKey && apiKey === serverApiKey) {
		next();
	} else {
		res.status(401).json({ message: 'Unauthorized: Missing or invalid API key.' });
	}
};

interface ProcessResult {
	processed: number,
	rejected: number
}

interface ParsedRecord {
	cardNumber: string;
	timestamp: string;
	amount: number;
	originalRecord: string; // Used for logging rejections
}

export function parseCsvContent(content: string): ParsedRecord[] {
	const lines = content.split('\n').slice(1); // Skip header row
	const records: ParsedRecord[] = [];

	for (const line of lines) {
			if (line.trim() === '') continue;
			const [cardNumber, timestamp, amount] = line.trim().split(',');
			records.push({ cardNumber, timestamp, amount: parseFloat(amount), originalRecord: line });
	}

	return records;
}

export function parseJsonContent(content: string): ParsedRecord[] {
	const data = JSON.parse(content);
	if (!Array.isArray(data)) {
			throw new Error('JSON data is not an array of transactions');
	}
	return data.map(item => ({
			...item,
			originalRecord: JSON.stringify(item)
	}));
}

export async function parseXmlContent(content: string): Promise<ParsedRecord[]> {
	const data = await xmlParser.parseStringPromise(content);

	if (!data.transactions || !data.transactions.transaction) {
		return [];
	}

	// Ensure transactions.transaction is an array, even if there's only one
	const transactions = Array.isArray(data.transactions.transaction)
			? data.transactions.transaction
			: [data.transactions.transaction];

	return transactions.map((item: any) => ({
		cardNumber: item.cardNumber,
		timestamp: item.timestamp,
		amount: parseFloat(item.amount),
		// Reconstruct the original XML record for better logging.
		originalRecord: js2xml({ transaction: item }, { compact: true, spaces: 2 })
}));
}

export async function processUploadedFile(file: Express.Multer.File): Promise<ProcessResult> {
	const fileContent = file.buffer.toString('utf-8');

	const allValidTransactions = [];
	const allRejectedTransactions = [];

	let records: ParsedRecord[] = [];
	try {
		switch (file.mimetype) {
			case 'text/csv':
					records = parseCsvContent(fileContent);
					break;
			case 'application/json':
					records = parseJsonContent(fileContent);
					break;
			case 'text/xml':
			case 'application/xml':
					records = await parseXmlContent(fileContent);
					break;
			default:
					// If the file type is unsupported, create a single rejection and stop.
					await prisma.rejectedTransaction.create({
						data: {
								originalRecord: `File: ${file.originalname}`,
								rejectionReason: `Unsupported file type: ${file.mimetype}`,
						}
					});
					return {
							processed: 0,
							rejected: 1
					};
				}
		} catch (e) {
			// If parsing fails, create a single rejection for the whole file.
			await prisma.rejectedTransaction.create({
				data: {
						originalRecord: `File: ${file.originalname}`,
						rejectionReason: `Failed to parse file: ${(e as Error).message}`,
				}
			});
			return {
				processed: 0,
				rejected: 1
			};
		}

	for (const record of records) {
		let cardType: CardType | null = null;
		if (!record.cardNumber || !record.timestamp || !record.amount) {
			allRejectedTransactions.push({
				originalRecord: record.originalRecord,
				rejectionReason: 'Malformed record (missing fields)',
			});
			continue;
		}

		const firstDigit = record.cardNumber.charAt(0);
		if (firstDigit === '3') cardType = CardType.AMEX;
		else if (firstDigit === '4') cardType = CardType.VISA;
		else if (firstDigit === '5') cardType = CardType.MASTERCARD;
		else if (firstDigit === '6') cardType = CardType.DISCOVER;

		try {
			if (cardType) {
				allValidTransactions.push({
					cardNumber: record.cardNumber,
					cardType,
					timestamp: new Date(record.timestamp),
					amount: new Decimal(record.amount), // new Decimal() can handle numbers directly
				});
			} else {
				allRejectedTransactions.push({
					originalRecord: record.originalRecord,
					rejectionReason: 'Unrecognized card type',
				});
			}
		} catch (e) {
			 allRejectedTransactions.push({
					originalRecord: record.originalRecord,
					rejectionReason: `Invalid data format: ${(e as Error).message}`,
				});
		}
	}

	if (allValidTransactions.length > 0) {
		await prisma.transaction.createMany({ data: allValidTransactions });
	}
	if (allRejectedTransactions.length > 0) {
		await prisma.rejectedTransaction.createMany({ data: allRejectedTransactions });
	}

	return {
		processed: allValidTransactions.length,
		rejected: allRejectedTransactions.length
	}
}

const apiRouter = express.Router();
apiRouter.use(protectWithApiKey);

apiRouter.post('/process-transactions', upload.single('transactionFile'), async (req: Request, res: Response): Promise<void> => {
	try {
		const file = req.file;
		if (!file) {
			res.status(400).json({ message: 'No file uploaded.'});
			return;
		}

		const result = await processUploadedFile(file);

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
});

app.use('/api', apiRouter);

app.use((err: any, req: Request, res: Response, next: NextFunction): void => {
	if (err.code === 'LIMIT_FILE_SIZE') {
		res.status(413).json({ message: `File too large. Maximum size is 5MB.` });
		return;
	}

	if (err instanceof multer.MulterError) {
		res.status(400).json({ message: `File upload error: ${err.message}` });
		return
	}

	next(err);
});

export { app } 