import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import multer from 'multer';

const app = express();
const PORT = process.env.PORT || 5001;

// Configure multer for in-memory file storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

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
  amount: string;
  originalRecord: string; // Used for logging rejections
}

function parseCsvContent(content: string): ParsedRecord[] {
	const lines = content.split('\n').slice(1); // Skip header row
	const records: ParsedRecord[] = [];

	for (const line of lines) {
			if (line.trim() === '') continue;
			const [cardNumber, timestamp, amount] = line.trim().split(',');
			records.push({ cardNumber, timestamp, amount, originalRecord: line });
	}

	return records;
}

async function processUploadedFile(file: Express.Multer.File): Promise<ProcessResult> {
	const fileContent = file.buffer.toString('utf-8');

  let records: ParsedRecord[] = [];
	switch (file.mimetype) {
		case 'text/csv':
				records = parseCsvContent(fileContent);
				break;
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

app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});