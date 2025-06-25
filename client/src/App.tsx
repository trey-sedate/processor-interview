import { Layout } from './components/Layout';
import { Sidebar } from './components/Sidebar';
import { ResultsSummary } from './components/ResultsSummary';
import { TransactionTabs } from './components/TransactionTabs';

function App() {
	return (
		<Layout 
			sidebar={<Sidebar />}
			mainContent={
				<>
						<ResultsSummary />
						<TransactionTabs />
				</>
			}
		/>
	);
}

export default App