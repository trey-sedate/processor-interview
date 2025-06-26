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
});
