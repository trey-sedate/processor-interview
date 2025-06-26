import { useState } from 'react';
import { Title, Text, Card } from '@tremor/react';
import { useTransactionStore } from '../store/transactionStore';
import * as api from '../services/api';

export function Sidebar() {
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [apiKey, setApiKey] = useState(import.meta.env.VITE_API_KEY || '');

	const { setLoading, setError, setProcessResult, 
		setRejectedTransactions, setCardTypeSummary, setDailySummary, setCardSummary
	} = useTransactionStore();

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		if (event.target.files && event.target.files[0]) {
			setSelectedFile(event.target.files[0]);
		}
	};

	const handleProcess = async () => {
		if (!selectedFile || !apiKey) {
			setError('Please select a file and provide an API key.');
			return;
		}

		setLoading(true);
		setError(null);
		setProcessResult(null);
		setRejectedTransactions([]);

		try {
			const result = await api.processFile(selectedFile, apiKey);
			setProcessResult(result);

			const [cardTypeData, dailyData, cardData, rejected] = await Promise.all([
				api.getCardTypeReport(apiKey),
				api.getDailyReport(apiKey),
				api.getCardReport(apiKey),
				result.rejected > 0 ? api.getRejectedTransactions(apiKey) : Promise.resolve([]),
			]);

			setCardTypeSummary(cardTypeData);
			setDailySummary(dailyData);
			setCardSummary(cardData);
			setRejectedTransactions(rejected);

		} catch (err) {
			setError((err as Error).message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div>
			<Title>Card Processor</Title>
			<Text>Upload a file to begin.</Text>
			
			<Card className="mt-6">
				<h3 className="text-lg font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">Process New File</h3>
				<div className="mt-4 space-y-4">
						<input
								type="text"
								placeholder="API Key"
								value={apiKey}
								onChange={(e) => setApiKey(e.target.value)}
								className="w-full px-3 py-2 border border-slate-300 rounded-md"
						/>
						<input
								type="file"
								onChange={handleFileChange}
								className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
						/>
						<button
								onClick={handleProcess}
								// disabled={isLoading || !selectedFile || !apiKey}
								className="w-full px-4 py-2 text-sm font-semibold text-white bg-violet-600 rounded-full shadow-sm hover:bg-violet-700 disabled:bg-slate-300"
						>
								Process File
						</button>
				</div>
			</Card>
		</div>
	);
}