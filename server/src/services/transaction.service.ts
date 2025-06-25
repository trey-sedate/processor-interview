import { PrismaClient, CardType, Transaction, RejectedTransaction } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { ProcessResult, ParsedRecord } from '../types/transaction.types';
import { parseCsvContent } from '../parsers/csv.parser';
import { parseJsonContent } from '../parsers/json.parser';
import { parseXmlContent } from '../parsers/xml.parser';

const prisma = new PrismaClient();

export async function processUploadedFile(file: Express.Multer.File): Promise<ProcessResult> {
	const fileContent = file.buffer.toString('utf-8');

	const allValidTransactions = [];
	const allRejectedTransactions = [];

	let records: ParsedRecord[] = [];
	try {
		switch (file.mimetype) {
			case 'text/csv':
					records = parseCsvContent(fileContent);
					break;
			case 'application/json':
					records = parseJsonContent(fileContent);
					break;
			case 'text/xml':
			case 'application/xml':
					records = await parseXmlContent(fileContent);
					break;
			default:
					// If the file type is unsupported, create a single rejection and stop.
					await prisma.rejectedTransaction.create({
						data: {
								originalRecord: `File: ${file.originalname}`,
								rejectionReason: `Unsupported file type: ${file.mimetype}`,
						}
					});
					return {
							processed: 0,
							rejected: 1
					};
				}
		} catch (e) {
			// If parsing fails, create a single rejection for the whole file.
			await prisma.rejectedTransaction.create({
				data: {
						originalRecord: `File: ${file.originalname}`,
						rejectionReason: `Failed to parse file: ${(e as Error).message}`,
				}
			});
			return {
				processed: 0,
				rejected: 1
			};
		}

	for (const record of records) {
		let cardType: CardType | null = null;
		if (!record.cardNumber || !record.timestamp || !record.amount) {
			allRejectedTransactions.push({
				originalRecord: record.originalRecord,
				rejectionReason: 'Malformed record (missing fields)',
			});
			continue;
		}

		const firstDigit = record.cardNumber.charAt(0);
		if (firstDigit === '3') cardType = CardType.AMEX;
		else if (firstDigit === '4') cardType = CardType.VISA;
		else if (firstDigit === '5') cardType = CardType.MASTERCARD;
		else if (firstDigit === '6') cardType = CardType.DISCOVER;

		try {
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
					rejectionReason: 'Unrecognized card type',
				});
			}
		} catch (e) {
			 allRejectedTransactions.push({
					originalRecord: record.originalRecord,
					rejectionReason: `Invalid data format: ${(e as Error).message}`,
				});
		}
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