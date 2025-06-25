import { useState } from 'react';
import { 
	Card, 
	Title, 
	Text, 
	Grid, 
	Col, 
	Table,
	TableHead,
	TableRow,
	TableHeaderCell,
	TableBody,
	TableCell,
	Badge,
} from '@tremor/react';

interface RejectedTransaction {
	id: number;
	originalRecord: string;
	rejectionReason: string;
	processedAt: string;
}

function App() {
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	
	const [rejectedData, setRejectedData] = useState<RejectedTransaction[]>([]);

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		if (event.target.files && event.target.files[0]) {
			setSelectedFile(event.target.files[0]);
		}
	};

	const handleUpload = async () => {
		if (!selectedFile) {
			setError('Please select a file first.');
			return;
		}

		setIsLoading(true);
		setError(null);
		setRejectedData([]);

		const formData = new FormData();
		formData.append('transactionFile', selectedFile);

		const apiKey = import.meta.env.VITE_API_KEY;

		try {
			const processResponse = await fetch('http://localhost:5001/api/process-transactions', {
				method: 'POST',
				headers: { 'x-api-key': apiKey },
				body: formData,
			});

			if (!processResponse.ok) {
				const errorData = await processResponse.json();
				throw new Error(errorData.message || 'Failed to process file.');
			}

		} catch (err) {
			setError((err as Error).message);
		} finally {
			setIsLoading(false);
		}
	};
	
	return (
		<main className="bg-slate-50 p-6 sm:p-10">
			<Title>Card Transaction Processor</Title>
			<Text>Upload a transaction file (CSV, JSON, or XML) to process and view reports.</Text>

			<Card className="mt-6">
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
					<input
						type="file"
						onChange={handleFileChange}
						className="text-sm text-slate-500
							file:mr-4 file:py-2 file:px-4
							file:rounded-full file:border-0
							file:text-sm file:font-semibold
							file:bg-violet-50 file:text-violet-700
							hover:file:bg-violet-100"
					/>
					<button
						onClick={handleUpload}
						disabled={isLoading || !selectedFile}
						className="mt-4 sm:mt-0 px-4 py-2 text-sm font-semibold text-white bg-violet-600 rounded-full shadow-sm hover:bg-violet-700 disabled:bg-slate-300 disabled:cursor-not-allowed"
					>
						{isLoading ? 'Processing...' : 'Process File'}
					</button>
				</div>
				{error && <Text className="mt-4 text-red-500">{error}</Text>}
			</Card>

			<Grid numItemsMd={2} numItemsLg={3} className="gap-6 mt-6">
				<Col numColSpanMd={2} numColSpanLg={3}>
					<Card>
						<Title>Rejected Transactions</Title>
						<Table className="mt-5">
							<TableHead>
								<TableRow>
									<TableHeaderCell>Original Record</TableHeaderCell>
									<TableHeaderCell>Rejection Reason</TableHeaderCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{rejectedData.map((item) => (
									<TableRow key={item.id}>
										<TableCell className="font-mono text-xs">{item.originalRecord}</TableCell>
										<TableCell>
											<Badge color="red">{item.rejectionReason}</Badge>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</Card>
				</Col>
			</Grid>
		</main>
	);
}

export default App;
