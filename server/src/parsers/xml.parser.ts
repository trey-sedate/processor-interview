import { ParsedRecord } from '../types/transaction.types';
import { Parser as XmlParser } from 'xml2js';
import { js2xml } from 'xml-js';

const xmlParser = new XmlParser({ explicitArray: false });

export async function parseXmlContent(
	content: string,
): Promise<ParsedRecord[]> {
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
		originalRecord: js2xml({ transaction: item }, { compact: true, spaces: 2 }),
	}));
}
