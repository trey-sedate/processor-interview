import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
		res.send('Card Processor API is running...');
});

app.post('/api/process-transactions', async (req: Request, res: Response) => {
	try {
		res.status(200).json({ 
				message: 'Files processed successfully.', 
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