import { Layout } from './components/Layout';
import { Sidebar } from './components/Sidebar';
import { ResultsSummary } from './components/ResultsSummary';

function App() {
	return (
		<Layout 
			sidebar={<Sidebar />}
			mainContent={<ResultsSummary />}
		/>
	);
}

export default App;