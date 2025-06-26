import {
	PrismaClient,
	CardType,
	Transaction,
	RejectedTransaction,
} from '@prisma/client';
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
		orderBy: { processedAt: 'desc' },
	});
}

export async function processUploadedFile(
	file: Express.Multer.File,
	skipLuhn: boolean,
): Promise<ProcessResult> {
	await resetData();

	const parser = getParserForMimeType(file.mimetype);
	if (!parser) {
		await prisma.rejectedTransaction.create({
			data: {
				originalRecord: `File: ${file.originalname}`,
				rejectionReason: `Unsupported file type: ${file.mimetype}`,
			},
		});
		return { processed: 0, rejected: 1 };
	}

	const allValidTransactions = [];
	const allRejectedTransactions = [];

	try {
		const fileContent = file.buffer.toString('utf-8');
		const records = await Promise.resolve(parser(fileContent));
		for (const record of records) {
			const { cardType, rejectionReason } = validateRecord(record, skipLuhn);

			if (cardType && !rejectionReason) {
				const transactionDate = new Date(record.timestamp);
				allValidTransactions.push({
					cardNumber: record.cardNumber,
					cardType,
					timestamp: new Date(record.timestamp),
					day: transactionDate.toISOString().slice(0, 10), // YYYY-MM-DD format
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
			},
		});
		return { processed: 0, rejected: 1 };
	}

	if (allValidTransactions.length > 0) {
		await prisma.transaction.createMany({ data: allValidTransactions });
	}
	if (allRejectedTransactions.length > 0) {
		await prisma.rejectedTransaction.createMany({
			data: allRejectedTransactions,
		});
	}

	return {
		processed: allValidTransactions.length,
		rejected: allRejectedTransactions.length,
	};
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

// Luhn algorithm implementation for credit card validation
function isValidLuhn(cardNumber: string): boolean {
	if (!/^\d+$/.test(cardNumber)) {
		return false; // Not a string of digits
	}

	let sum = 0;
	let shouldDouble = false;
	for (let i = cardNumber.length - 1; i >= 0; i--) {
		let digit = parseInt(cardNumber.charAt(i), 10);

		if (shouldDouble) {
			digit *= 2;
			if (digit > 9) {
				digit -= 9;
			}
		}
		sum += digit;
		shouldDouble = !shouldDouble;
	}
	return sum % 10 === 0;
}

function validateRecord(
	record: ParsedRecord,
	skipLuhn: boolean,
): { cardType: CardType | null; rejectionReason: string | null } {
	if (!record.cardNumber || !record.timestamp || isNaN(record.amount)) {
		return {
			cardType: null,
			rejectionReason: 'Malformed record (missing fields or invalid amount)',
		};
	}

	if (!skipLuhn && !isValidLuhn(record.cardNumber)) {
		return {
			cardType: null,
			rejectionReason: 'Invalid card number (Luhn check failed)',
		};
	}

	const firstDigit = record.cardNumber.charAt(0);
	switch (firstDigit) {
		case '3':
			return { cardType: CardType.AMEX, rejectionReason: null };
		case '4':
			return { cardType: CardType.VISA, rejectionReason: null };
		case '5':
			return { cardType: CardType.MASTERCARD, rejectionReason: null };
		case '6':
			return { cardType: CardType.DISCOVER, rejectionReason: null };
		default:
			return { cardType: null, rejectionReason: 'Unrecognized card type' };
	}
}

export async function getCardTypeSummary() {
	const summary = await prisma.transaction.groupBy({
		by: ['cardType'],
		_sum: { amount: true },
		_count: { id: true },
		orderBy: { cardType: 'asc' },
	});
	// The default Decimal type from Prisma is not directly serializable, so we map it.
	return summary.map((item) => ({
		cardType: item.cardType,
		totalVolume: item._sum.amount ? item._sum.amount.toNumber() : 0,
		transactionCount: item._count.id,
	}));
}

export async function getDailySummary() {
	const summary = await prisma.transaction.groupBy({
		by: ['day'],
		_sum: { amount: true },
		_count: { id: true },
		orderBy: { day: 'asc' },
	});

	return summary.map((item) => ({
		day: item.day,
		totalVolume: item._sum.amount ? item._sum.amount.toNumber() : 0,
		transactionCount: item._count.id,
	}));
}

export async function getCardSummary() {
	const summary = await prisma.transaction.groupBy({
		by: ['cardNumber', 'cardType'],
		_sum: { amount: true },
		_count: { id: true },
		orderBy: {
			_sum: {
				amount: 'desc',
			},
		},
	});
	return summary.map((item) => ({
		cardNumber: item.cardNumber,
		cardType: item.cardType,
		totalVolume: item._sum.amount ? item._sum.amount.toNumber() : 0,
		transactionCount: item._count.id,
	}));
}
