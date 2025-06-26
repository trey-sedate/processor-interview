export interface RejectedTransaction {
	id: number;
	originalRecord: string;
	rejectionReason: string;
	processedAt: string;
}

export interface ProcessResult {
	processed: number;
	rejected: number;
}

export interface CardTypeSummary {
	cardType: string;
	totalVolume: number;
	transactionCount: number;
}

export interface DailySummary {
	day: string;
	totalVolume: number;
	transactionCount: number;
}

export interface CardSummary {
	cardNumber: string;
	cardType: string;
	totalVolume: number;
	transactionCount: number;
}
export interface AppState {
	isLoading: boolean;
	error: string | null;
	processResult: ProcessResult | null;
	rejectedTransactions: RejectedTransaction[];
	cardTypeSummary: CardTypeSummary[];
	dailySummary: DailySummary[];
	cardSummary: CardSummary[];
	setLoading: (isLoading: boolean) => void;
	setError: (error: string | null) => void;
	setProcessResult: (result: ProcessResult | null) => void;
	setRejectedTransactions: (transactions: RejectedTransaction[]) => void;
	setCardTypeSummary: (summary: CardTypeSummary[]) => void;
	setDailySummary: (summary: DailySummary[]) => void;
	setCardSummary: (summary: CardSummary[]) => void;
	fetchInitialData: (apiKey: string) => void;
}
