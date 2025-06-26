import { create } from 'zustand';
import type { AppState } from '../types';
import * as api from '../services/api';

const initialState: AppState = {
	isLoading: false,
	error: null,
	processResult: null,
	rejectedTransactions: [],
	cardTypeSummary: [],
	dailySummary: [],
	cardSummary: [],
	setLoading: () => {},
	setError: () => {},
	setProcessResult: () => {},
	setRejectedTransactions: () => {},
	setCardTypeSummary: () => {},
	setDailySummary: () => {},
	setCardSummary: () => {},
	fetchInitialData: async () => {},
};

export const useTransactionStore = create<AppState>((set, get) => ({
	isLoading: false,
	error: null,
	processResult: null,
	rejectedTransactions: [],
	cardTypeSummary: [],
	dailySummary: [],
	cardSummary: [],

	setLoading: (isLoading) => set({ isLoading }),
	setError: (error) => set({ error }),
	setProcessResult: (result) => set({ processResult: result }),
	setRejectedTransactions: (transactions) =>
		set({ rejectedTransactions: transactions }),
	setCardTypeSummary: (summary) => set({ cardTypeSummary: summary }),
	setDailySummary: (summary) => set({ dailySummary: summary }),
	setCardSummary: (summary) => set({ cardSummary: summary }),

	fetchInitialData: async (apiKey: string) => {
		if (get().isLoading) return;
		set({ isLoading: true, error: null });

		try {
			const [cardTypeSummary, daySummary, cardSummary, rejected] =
				await Promise.all([
					api.getCardTypeReport(apiKey),
					api.getDailyReport(apiKey),
					api.getCardReport(apiKey),
					api.getRejectedTransactions(apiKey),
				]);

			// We can create a "processResult" from the fetched data.
			if (
				cardSummary.length > 0 ||
				daySummary.length > 0 ||
				rejected.length > 0
			) {
				const totalProcessed = cardSummary.reduce(
					(sum, item) => sum + item.transactionCount,
					0,
				);
				set({
					processResult: {
						processed: totalProcessed,
						rejected: rejected.length,
					},
					cardTypeSummary: cardTypeSummary,
					dailySummary: daySummary,
					cardSummary: cardSummary,
					rejectedTransactions: rejected,
				});
			}
		} catch (err) {
			set({ error: (err as Error).message });
		} finally {
			set({ isLoading: false });
		}
	},

	clearResults: () => set(initialState),
}));
