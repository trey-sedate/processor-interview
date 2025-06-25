import { describe, it, expect, vi, afterEach } from 'vitest';
import { processFile } from './api';

global.fetch = vi.fn();

describe('api service', () => {
	afterEach(() => {
		vi.clearAllMocks();
	});

	it('processFile should call fetch with the correct arguments', async () => {
		const mockFile = new File(['test'], 'test.csv', { type: 'text/csv' });
		const mockApiKey = 'test-key';
		
		// Setup the mock response
		(fetch as vi.Mock).mockResolvedValue({
			ok: true,
			json: () => Promise.resolve({ processed: 1, rejected: 0 }),
		});

		await processFile(mockFile, mockApiKey);

		// Check that fetch was called
		expect(fetch).toHaveBeenCalledTimes(1);
		
		// Check the URL
		expect(fetch).toHaveBeenCalledWith(
				'http://localhost:5001/api/process-transactions',
				expect.anything() // We don't need to check the full options object here
		);
	});
});
