import { ParsedRecord } from '../types/transaction.types';

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