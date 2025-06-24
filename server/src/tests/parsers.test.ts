import { parseCsvContent, parseJsonContent, parseXmlContent } from '../app'; // Adjust to your file structure

describe('File Parsers', () => {

	// --- CSV Parser Tests ---
	describe('parseCsvContent', () => {
		it('should correctly parse valid CSV content with multiple lines', () => {
			const csvContent = 'cardNumber,timestamp,amount\n4242,2025-01-01T00:00:00Z,100.50\n5555,2025-01-02T12:30:00Z,-25.00';
			const result = parseCsvContent(csvContent);

			expect(result).toHaveLength(2);
			expect(result[0]).toEqual({
				cardNumber: '4242',
				timestamp: '2025-01-01T00:00:00Z',
				amount: 100.50,
				originalRecord: '4242,2025-01-01T00:00:00Z,100.50'
			});
			expect(result[1].amount).toBe(-25.00);
		});

		it('should return an empty array for an empty string', () => {
			expect(parseCsvContent('')).toEqual([]);
		});

		it('should return an empty array for a CSV with only a header', () => {
			expect(parseCsvContent('cardNumber,timestamp,amount')).toEqual([]);
		});

		it('should handle CSV content with blank lines', () => {
			const csvContent = 'cardNumber,timestamp,amount\n\n4242,2025-01-01T00:00:00Z,100.50\n';
			const result = parseCsvContent(csvContent);
			expect(result).toHaveLength(1);
		});

		it('should handle Windows-style line endings (\\r\\n)', () => {
			const csvContent = 'cardNumber,timestamp,amount\r\n4242,2025-01-01T00:00:00Z,100.50\r\n';
			 const result = parseCsvContent(csvContent);
			expect(result).toHaveLength(1);
		});
	});

	// --- JSON Parser Tests ---
	describe('parseJsonContent', () => {
		it('should correctly parse valid JSON content', () => {
			const jsonContent = '[{"cardNumber":"5555","timestamp":"2025-01-02T12:00:00Z","amount":-50}]';
			const result = parseJsonContent(jsonContent);
			
			expect(result).toHaveLength(1);
			expect(result[0]).toEqual({
				cardNumber: '5555',
				timestamp: '2025-01-02T12:00:00Z',
				amount: -50,
				originalRecord: '{"cardNumber":"5555","timestamp":"2025-01-02T12:00:00Z","amount":-50}'
			});
		});

		it('should return an empty array for an empty JSON array', () => {
			expect(parseJsonContent('[]')).toEqual([]);
		});

		it('should throw an error for malformed JSON', () => {
			const malformedJson = '[{"cardNumber":]';
			expect(() => parseJsonContent(malformedJson)).toThrow();
		});
		
		it('should throw an error if the top-level structure is not an array', () => {
			const nonArrayJson = '{"cardNumber":"5555","timestamp":"2025-01-02T12:00:00Z","amount":-50}';
			expect(() => parseJsonContent(nonArrayJson)).toThrow('JSON data is not an array of transactions');
		});
	});

	// --- XML Parser Tests ---
	describe('parseXmlContent', () => {
		it('should correctly parse valid XML with multiple transactions', async () => {
			const xmlContent = `
				<transactions>
					<transaction>
						<cardNumber>3333</cardNumber>
						<timestamp>2025-01-03T10:00:00Z</timestamp>
						<amount>250.75</amount>
					</transaction>
					<transaction>
						<cardNumber>6666</cardNumber>
						<timestamp>2025-01-04T11:00:00Z</timestamp>
						<amount>-50.25</amount>
					</transaction>
				</transactions>
			`;
			const result = await parseXmlContent(xmlContent);

			expect(result).toHaveLength(2);
			expect(result[0].cardNumber).toBe('3333');
			expect(result[1].amount).toBe(-50.25);
		});

		it('should correctly parse valid XML with a single transaction', async () => {
				const xmlContent = `
				<transactions>
					<transaction>
						<cardNumber>3333</cardNumber>
						<timestamp>2025-01-03T10:00:00Z</timestamp>
						<amount>250.75</amount>
					</transaction>
				</transactions>
			`;
			const result = await parseXmlContent(xmlContent);

			expect(result).toHaveLength(1);
			expect(result[0].cardNumber).toBe('3333');
			expect(result[0].amount).toBe(250.75);
		});

		it('should throw an error for malformed XML', async () => {
			const malformedXml = '<transactions><transaction>'; // Missing closing tags
			await expect(parseXmlContent(malformedXml)).rejects.toThrow();
		});

		it('should return an empty array for an empty transactions block', async () => {
			const emptyXml = '<transactions></transactions>';
			const result = await parseXmlContent(emptyXml);
			expect(result).toEqual([]);
		});
	});
});
