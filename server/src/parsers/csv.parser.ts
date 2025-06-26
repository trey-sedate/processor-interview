import { ParsedRecord } from '../types/transaction.types';

export function parseCsvContent(content: string): ParsedRecord[] {
	const lines = content.split('\n').slice(1); // Skip header row
	const records: ParsedRecord[] = [];

	for (const line of lines) {
		if (line.trim() === '') continue;
		const [cardNumber, timestamp, amount] = line.trim().split(',');
		records.push({
			cardNumber,
			timestamp,
			amount: parseFloat(amount),
			originalRecord: line,
		});
	}

	return records;
}
