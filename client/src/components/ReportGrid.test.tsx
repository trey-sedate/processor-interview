
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ReportGrid } from './ReportGrid';
import { useTransactionStore } from '../store/transactionStore';

vi.mock('@tremor/react', async (importOriginal) => {
	const original = await importOriginal<typeof import('@tremor/react')>();
	return {
			...original,
			BarChart: () => <div>Bar Chart Mock</div>,
			DonutChart: () => <div>Donut Chart Mock</div>,
	};
});

describe('ReportGrid', () => {
	it('should render nothing if processResult is null', () => {
		useTransactionStore.setState({ processResult: null });
		const { container } = render(<ReportGrid />);
		expect(container).toBeEmptyDOMElement();
	});

	it('should render the chart titles when data is available', () => {
		useTransactionStore.setState({ 
				processResult: { processed: 1, rejected: 0 },
				cardTypeSummary: [{ cardType: 'VISA', totalVolume: 100, transactionCount: 1 }],
				dailySummary: [{ day: '2025-01-01', totalVolume: 100, transactionCount: 1 }],
				cardSummary: [{ cardNumber: '4242', cardType: 'VISA', totalVolume: 100, transactionCount: 1 }]
		});
		render(<ReportGrid />);
		
		expect(screen.getByText('Volume by Card Type')).toBeInTheDocument();
		expect(screen.getByText('Transaction Count by Type')).toBeInTheDocument();
		expect(screen.getByText('Volume by Day')).toBeInTheDocument();
		expect(screen.getByText('Summary by Card Number')).toBeInTheDocument();
	});
});