import type { ProcessResult } from '../types';

const API_URL = 'http://localhost:5001/api';

export async function processFile(file: File, apiKey: string): Promise<ProcessResult> {
	const formData = new FormData();
	formData.append('transactionFile', file);

	const response = await fetch(`${API_URL}/process-transactions`, {
		method: 'POST',
		headers: { 'x-api-key': apiKey },
		body: formData,
	});

	const data = await response.json();
	if (!response.ok) {
		throw new Error(data.message || 'An unknown error occurred during processing.');
	}

	return {
		processed: data.processed,
		rejected: data.rejected
	};
}