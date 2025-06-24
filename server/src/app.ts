import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import multer from 'multer';
import { Parser as XmlParser } from 'xml2js';
import { js2xml } from 'xml-js';

const app = express();
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

app.use('/', protectWithApiKey);

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
					return {
							processed: 0,
							rejected: 1
					};
				}
		} catch (e) {
			// If parsing fails, create a single rejection for the whole file.
			return {
				processed: 0,
				rejected: 1
			};
		}

	console.log(records);

	return {
		processed: 0,
		rejected: 0
	}
}

app.get('/', (req: Request, res: Response) => {
		res.send('Card Processor API is running...');
});

app.post('/api/process-transactions', upload.single('transactionFile'), async (req: Request, res: Response): Promise<void> => {
	const file = req.file;
	if (!file) {
		res.status(400).json({ message: 'No file uploaded.'});
		return;
	}

	const result = await processUploadedFile(file);

	try {
		res.status(200).json({ 
				message: 'Files processed successfully.', 
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

export { app } 