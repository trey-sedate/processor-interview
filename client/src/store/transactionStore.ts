import { create } from 'zustand';
import type { AppState } from '../types';

export const useTransactionStore = create<AppState>((set) => ({
	isLoading: false,
	error: null,
	processResult: null,

	setLoading: (isLoading) => set({ isLoading }),
	setError: (error) => set({ error }),
	setProcessResult: (result) => set({ processResult: result }),
}));