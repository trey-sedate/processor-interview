export interface ProcessResult {
	processed: number;
	rejected: number;
}

export interface AppState {
	isLoading: boolean;
	error: string | null;
	processResult: ProcessResult | null;
	setLoading: (isLoading: boolean) => void;
	setError: (error: string | null) => void;
	setProcessResult: (result: ProcessResult | null) => void;
}