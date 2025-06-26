export interface ProcessResult {
	processed: number;
	rejected: number;
}

export interface ParsedRecord {
	cardNumber: string;
	timestamp: string;
	amount: number;
	originalRecord: string;
}
