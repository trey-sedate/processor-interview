import { describe, it, expect, beforeEach } from 'vitest';
import { useTransactionStore } from './transactionStore';

describe('useTransactionStore', () => {
	beforeEach(() => {
		useTransactionStore.setState({
			isLoading: false,
			error: null,
			processResult: null,
		});
	});

	it('should set loading state', () => {
		useTransactionStore.getState().setLoading(true);
		expect(useTransactionStore.getState().isLoading).toBe(true);
	});

	it('should set an error message', () => {
		useTransactionStore.getState().setError('Test error');
		expect(useTransactionStore.getState().error).toBe('Test error');
	});

	it('should set the process result', () => {
		const result = { processed: 10, rejected: 2 };
		useTransactionStore.getState().setProcessResult(result);
		expect(useTransactionStore.getState().processResult).toEqual(result);
	});

	it('should set rejected transactions', () => {
		const mockRejected = [
			{
				id: 1,
				originalRecord: 'a,b,c',
				rejectionReason: 'test',
				processedAt: '',
			},
		];
		useTransactionStore.getState().setRejectedTransactions(mockRejected);
		expect(useTransactionStore.getState().rejectedTransactions).toEqual(
			mockRejected,
		);
	});
});
