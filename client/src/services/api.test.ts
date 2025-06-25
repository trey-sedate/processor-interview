import { describe, it, expect, vi, afterEach } from 'vitest';
import { processFile, getRejectedTransactions } from './api';

global.fetch = vi.fn();

describe('api service', () => {
	afterEach(() => {
		vi.clearAllMocks();
	});

	it('processFile should call fetch with the correct arguments', async () => {
		const mockFile = new File(['test'], 'test.csv', { type: 'text/csv' });
		const mockApiKey = 'test-key';
		
		(fetch as vi.Mock).mockResolvedValue({
			ok: true,
			json: () => Promise.resolve({ processed: 1, rejected: 0 }),
		});

		await processFile(mockFile, mockApiKey);

		expect(fetch).toHaveBeenCalledTimes(1);
		
		expect(fetch).toHaveBeenCalledWith(
				'http://localhost:5001/api/process-transactions',
				expect.anything() // We don't need to check the full options object here
		);
	});

	it('getRejectedTransactions should call the correct endpoint', async () => {
		(fetch as vi.Mock).mockResolvedValue({
			ok: true,
			json: () => Promise.resolve([]),
		});

		await getRejectedTransactions('test-key');
		
		expect(fetch).toHaveBeenCalledWith(
				'http://localhost:5001/api/reporting/rejected-transactions',
				expect.anything()
		);
	});
});
