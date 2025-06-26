import { useEffect } from 'react';
import { Layout } from './components/Layout';
import { Sidebar } from './components/Sidebar';
import { ResultsSummary } from './components/ResultsSummary';
import { TransactionTabs } from './components/TransactionTabs';
import { ReportGrid } from './components/ReportGrid';
import { useTransactionStore } from './store/transactionStore';

function App() {
	const { fetchInitialData } = useTransactionStore();

	useEffect(() => {
		const apiKey = import.meta.env.VITE_API_KEY;
		if (apiKey) {
			fetchInitialData(apiKey);
		}
	}, [fetchInitialData]);

	return (
		<Layout 
			sidebar={<Sidebar />}
			mainContent={
					<>
							<div className="grid grid-cols-4 gap-4">
									<div className="col-span-1">
											<ResultsSummary />
									</div>
									<div className="col-span-3">
											<TransactionTabs />
									</div>
							</div>
							<ReportGrid />
					</>
			}
	/>
	);
}

export default App