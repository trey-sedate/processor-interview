import request from 'supertest';

describe('API Integration Tests', () => {
	let app: any;

	const apiKey = process.env.API_SECRET_KEY || '';

	beforeAll(() => {
		app = require('../app').app;
	});

	describe('POST /api/process-transactions', () => {
		it('should return 401 if no API key is provided', async () => {
			const response = await request(app).post('/api/process-transactions');

			expect(response.status).toBe(401);
		});

		it('should return 400 if no file is uploaded (with valid API key)', async () => {
			const response = await request(app)
				.post('/api/process-transactions')
				.set('x-api-key', apiKey);

			expect(response.status).toBe(400);
			expect(response.body.message).toBe('No file uploaded.');
		});

		it('should process a valid CSV file and return a 200 status', async () => {
			const csvBuffer = Buffer.from(
				'cardNumber,timestamp,amount\n4242424242424242,2025-01-01T00:00:00Z,150.00',
			);

			const response = await request(app)
				.post('/api/process-transactions')
				.set('x-api-key', apiKey)
				.attach('transactionFile', csvBuffer, {
					filename: 'test.csv',
					contentType: 'text/csv',
				});

			expect(response.status).toBe(200);
			expect(response.body).toEqual({
				message: 'File processed successfully.',
				processed: 1,
				rejected: 0,
			});
		});

		it('should process a valid JSON file and return a 200 status', async () => {
			const jsonBuffer = Buffer.from(
				'[{"cardNumber":"5555555555555555","timestamp":"2025-01-02T12:00:00Z","amount":-50}]',
			);

			const response = await request(app)
				.post('/api/process-transactions')
				.set('x-api-key', apiKey)
				.attach('transactionFile', jsonBuffer, {
					filename: 'test.json',
					contentType: 'application/json',
				});

			expect(response.status).toBe(200);
			expect(response.body.processed).toBe(1);
		});

		it('should process a valid XML file and return a 200 status', async () => {
			const xmlBuffer = Buffer.from(
				'<transactions><transaction><cardNumber>3333333333333333</cardNumber><timestamp>2025-01-03T10:00:00Z</timestamp><amount>250.75</amount></transaction></transactions>',
			);

			const response = await request(app)
				.post('/api/process-transactions')
				.set('x-api-key', apiKey)
				.attach('transactionFile', xmlBuffer, {
					filename: 'test.xml',
					contentType: 'text/xml',
				});

			expect(response.status).toBe(200);
			expect(response.body.processed).toBe(1);
		});

		it('should reject a file with an unsupported type', async () => {
			const txtBuffer = Buffer.from('this is just a text file');

			const response = await request(app)
				.post('/api/process-transactions')
				.set('x-api-key', apiKey)
				.attach('transactionFile', txtBuffer, {
					filename: 'test.txt',
					contentType: 'text/plain',
				});

			expect(response.status).toBe(200);
			expect(response.body.processed).toBe(0);
			expect(response.body.rejected).toBe(1);
		});

		it('should correctly process a file with mixed valid and invalid records', async () => {
			const mixedContent =
				'cardNumber,timestamp,amount\n' +
				'4111111111111111,2025-01-01T00:00:00Z,100.00\n' + // Valid Visa
				'9999999999999999,2025-01-02T00:00:00Z,200.00'; // Invalid card type

			const response = await request(app)
				.post('/api/process-transactions')
				.set('x-api-key', apiKey)
				.attach('transactionFile', Buffer.from(mixedContent), {
					filename: 'mixed.csv',
					contentType: 'text/csv',
				});

			expect(response.status).toBe(200);
			expect(response.body.processed).toBe(1);
			expect(response.body.rejected).toBe(1);
		});

		it('should reject a record with an invalid data format (e.g., non-numeric amount)', async () => {
			const badData =
				'cardNumber,timestamp,amount\n' +
				'5111111111111111,2025-01-01T00:00:00Z,NOT_A_NUMBER';

			const response = await request(app)
				.post('/api/process-transactions')
				.set('x-api-key', apiKey)
				.attach('transactionFile', Buffer.from(badData), {
					filename: 'baddata.csv',
					contentType: 'text/csv',
				});

			expect(response.status).toBe(200);
			expect(response.body.processed).toBe(0);
			expect(response.body.rejected).toBe(1);
		});

		it('should return 413 if the uploaded file is too large', async () => {
			// Create a buffer larger than the 5MB limit
			// Mock Multer in case we want to put this in a cloud pipeline with resource constraints
			const largeBuffer = Buffer.alloc(6 * 1024 * 1024);

			const response = await request(app)
				.post('/api/process-transactions')
				.set('x-api-key', apiKey)
				.attach('transactionFile', largeBuffer, {
					filename: 'largefile.bin',
					contentType: 'application/octet-stream',
				});

			expect(response.status).toBe(413);
			expect(response.body.message).toContain('File too large');
		});
	});
});
