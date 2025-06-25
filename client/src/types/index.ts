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

export interface AppState {
	isLoading: boolean;
	error: string | null;
	processResult: ProcessResult | null;
	rejectedTransactions: RejectedTransaction[];
	setLoading: (isLoading: boolean) => void;
	setError: (error: string | null) => void;
	setProcessResult: (result: ProcessResult | null) => void;
	setRejectedTransactions: (transactions: RejectedTransaction[]) => void;
}