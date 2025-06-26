import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { RejectedTransactions } from './RejectedTransactions';
import { useTransactionStore } from '../store/transactionStore';

describe('RejectedTransactions', () => {
	it('should render nothing if processResult is null', () => {
		useTransactionStore.setState({ processResult: null });
		const { container } = render(<RejectedTransactions />);
		expect(container).toBeEmptyDOMElement();
	});

	it('should display the rejected transactions table when data is available', () => {
		useTransactionStore.setState({
			processResult: { processed: 8, rejected: 2 },
			rejectedTransactions: [
				{
					id: 1,
					originalRecord: 'a,b,c',
					rejectionReason: 'Bad card',
					processedAt: '',
				},
				{
					id: 2,
					originalRecord: 'd,e,f',
					rejectionReason: 'Bad date',
					processedAt: '',
				},
			],
		});
		render(<RejectedTransactions />);

		// Vitest doesn't automatically switch tabs, so we check the content of the default panel
		// A more advanced test could simulate a click.
		expect(screen.getByText('Bad card')).toBeInTheDocument();
		expect(screen.getByText('Bad date')).toBeInTheDocument();
	});
});
