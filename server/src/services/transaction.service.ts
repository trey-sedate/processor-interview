import { PrismaClient, CardType, Transaction, RejectedTransaction } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { ProcessResult, ParsedRecord } from '../types/transaction.types';
import { parseCsvContent } from '../parsers/csv.parser';
import { parseJsonContent } from '../parsers/json.parser';
import { parseXmlContent } from '../parsers/xml.parser';

const prisma = new PrismaClient();

export async function resetData() {
	await prisma.transaction.deleteMany({});
	await prisma.rejectedTransaction.deleteMany({});
}

export async function getRejected() {
	return prisma.rejectedTransaction.findMany({
			orderBy: { processedAt: 'desc' }
	});
}

export async function processUploadedFile(file: Express.Multer.File): Promise<ProcessResult> {
	await resetData();

	const parser = getParserForMimeType(file.mimetype);
	if (!parser) {
		await prisma.rejectedTransaction.create({
			data: {
					originalRecord: `File: ${file.originalname}`,
					rejectionReason: `Unsupported file type: ${file.mimetype}`,
			}
		});
		return { processed: 0, rejected: 1 };
	}

	const allValidTransactions = [];
	const allRejectedTransactions = [];

	try {
		const fileContent = file.buffer.toString('utf-8');
		const records = await Promise.resolve(parser(fileContent));
		for (const record of records) {
			const { cardType, rejectionReason } = validateRecord(record);

			if (cardType) {
				allValidTransactions.push({
					cardNumber: record.cardNumber,
					cardType,
					timestamp: new Date(record.timestamp),
					amount: new Decimal(record.amount), // new Decimal() can handle numbers directly
				});
			} else {
				allRejectedTransactions.push({
					originalRecord: record.originalRecord,
					rejectionReason: rejectionReason || 'Unknown validation error',
				});
			}
		}
	} catch (e) {
		await prisma.rejectedTransaction.create({
			data: {
				originalRecord: `File: ${file.originalname}`,
				rejectionReason: `Failed to parse file: ${(e as Error).message}`,
			}
		});
		return { processed: 0, rejected: 1 };
	}

	if (allValidTransactions.length > 0) {
		await prisma.transaction.createMany({ data: allValidTransactions });
	}
	if (allRejectedTransactions.length > 0) {
		await prisma.rejectedTransaction.createMany({ data: allRejectedTransactions });
	}

	return {
		processed: allValidTransactions.length,
		rejected: allRejectedTransactions.length
	}
}

function getParserForMimeType(mimeType: string) {
	switch (mimeType) {
		case 'text/csv':
			return parseCsvContent;
		case 'application/json':
			return parseJsonContent;
		case 'text/xml':
		case 'application/xml':
			return parseXmlContent;
		default:
			return null;
	}
}

function validateRecord(record: ParsedRecord): { cardType: CardType | null; rejectionReason: string | null } {
	if (!record.cardNumber || !record.timestamp || isNaN(record.amount)) {
		return { cardType: null, rejectionReason: 'Malformed record (missing fields or invalid amount)' };
	}

	const firstDigit = record.cardNumber.charAt(0);
	switch (firstDigit) {
		case '3': return { cardType: CardType.AMEX, rejectionReason: null };
		case '4': return { cardType: CardType.VISA, rejectionReason: null };
		case '5': return { cardType: CardType.MASTERCARD, rejectionReason: null };
		case '6': return { cardType: CardType.DISCOVER, rejectionReason: null };
		default: return { cardType: null, rejectionReason: 'Unrecognized card type' };
	}
}