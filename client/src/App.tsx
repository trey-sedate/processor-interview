import { useEffect } from 'react';
import { Layout } from './components/Layout';
import { Sidebar } from './components/Sidebar';
import { ResultsSummary } from './components/ResultsSummary';
import { TransactionTabs } from './components/TransactionTabs';
import { ReportGrid } from './components/ReportGrid';
import { useTransactionStore } from './store/transactionStore';

function App() {
	const { fetchInitialData, isLoading } = useTransactionStore();

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
				isLoading ? (
					<div className="flex justify-center items-center h-screen">
							<div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
					</div>
					) : (
					<>
							<div className="grid grid-cols-1 2xl:grid-cols-6 gap-4">
									<div className="2xl:col-span-2">
											<ResultsSummary />
									</div>
									<div className="2xl:col-span-4">
											<TransactionTabs />
									</div>
							</div>
							<ReportGrid />
					</>
			)
			}
		/>
	);
}

export default App;