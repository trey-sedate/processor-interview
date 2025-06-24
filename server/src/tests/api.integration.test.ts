import request from 'supertest';
import { app } from '../app';

describe('API Integration Tests', () => {
	const apiKey = process.env.API_SECRET_KEY || '';

	describe('POST /api/process-transactions', () => {

		it('should return 401 if no API key is provided', async () => {
			const response = await request(app)
				.post('/api/process-transactions');

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
			const csvBuffer = Buffer.from('cardNumber,timestamp,amount\n4242424242424242,2025-01-01T00:00:00Z,150.00');

			const response = await request(app)
				.post('/api/process-transactions')
				.set('x-api-key', apiKey)
				.attach('transactionFile', csvBuffer, {
					filename: 'test.csv',
					contentType: 'text/csv'
				});

			expect(response.status).toBe(200);
			expect(response.body).toEqual({
				message: 'File processed successfully.',
				processed: 1,
				rejected: 0
			});
		});

		it('should process a valid JSON file and return a 200 status', async () => {
			const jsonBuffer = Buffer.from('[{"cardNumber":"5555555555555555","timestamp":"2025-01-02T12:00:00Z","amount":-50}]');
			
			const response = await request(app)
				.post('/api/process-transactions')
				.set('x-api-key', apiKey)
				.attach('transactionFile', jsonBuffer, {
					filename: 'test.json',
					contentType: 'application/json'
				});
				
			expect(response.status).toBe(200);
			expect(response.body.processed).toBe(1);
		});

		it('should process a valid XML file and return a 200 status', async () => {
			const xmlBuffer = Buffer.from('<transactions><transaction><cardNumber>3333333333333333</cardNumber><timestamp>2025-01-03T10:00:00Z</timestamp><amount>250.75</amount></transaction></transactions>');
			
			const response = await request(app)
				.post('/api/process-transactions')
				.set('x-api-key', apiKey)
				.attach('transactionFile', xmlBuffer, {
					filename: 'test.xml',
					contentType: 'text/xml'
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
					contentType: 'text/plain'
				});

			expect(response.status).toBe(200);
			expect(response.body.processed).toBe(0);
			expect(response.body.rejected).toBe(1);
		});

	});
});
