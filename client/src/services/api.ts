import type {
	ProcessResult,
	RejectedTransaction,
	CardTypeSummary,
	DailySummary,
	CardSummary,
} from '../types';

const API_URL = 'http://localhost:5001/api';

export async function processFile(
	file: File,
	apiKey: string,
	skipLuhn: boolean,
): Promise<ProcessResult> {
	const formData = new FormData();
	formData.append('transactionFile', file);
	formData.append('skipLuhn', String(skipLuhn));

	const response = await fetch(`${API_URL}/process-transactions`, {
		method: 'POST',
		headers: { 'x-api-key': apiKey },
		body: formData,
	});

	const data = await response.json();
	if (!response.ok) {
		throw new Error(
			data.message || 'An unknown error occurred during processing.',
		);
	}

	return {
		processed: data.processed,
		rejected: data.rejected,
	};
}

export async function getRejectedTransactions(
	apiKey: string,
): Promise<RejectedTransaction[]> {
	const response = await fetch(`${API_URL}/reporting/rejected-transactions`, {
		headers: { 'x-api-key': apiKey },
	});

	if (!response.ok) {
		throw new Error('Failed to fetch rejected transactions.');
	}

	return response.json();
}

export async function getCardTypeReport(
	apiKey: string,
): Promise<CardTypeSummary[]> {
	const response = await fetch(`${API_URL}/reporting/summary-by-card-type`, {
		headers: { 'x-api-key': apiKey },
	});
	if (!response.ok) throw new Error('Failed to fetch card type summary.');
	return response.json();
}

export async function getDailyReport(apiKey: string): Promise<DailySummary[]> {
	const response = await fetch(`${API_URL}/reporting/summary-by-day`, {
		headers: { 'x-api-key': apiKey },
	});
	if (!response.ok) throw new Error('Failed to fetch daily summary.');
	return response.json();
}

export async function getCardReport(apiKey: string): Promise<CardSummary[]> {
	const response = await fetch(`${API_URL}/reporting/summary-by-card`, {
		headers: { 'x-api-key': apiKey },
	});
	if (!response.ok) throw new Error('Failed to fetch card summary.');
	return response.json();
}
