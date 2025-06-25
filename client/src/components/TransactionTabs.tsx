import { Card, Tab, TabGroup, TabList, TabPanel, TabPanels, Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow, Badge, Text } from '@tremor/react';
import { useTransactionStore } from '../store/transactionStore';

export function TransactionTabs() {
	const { rejectedTransactions, processResult } = useTransactionStore();

	if (!processResult) {
		return null;
	}

	return (
		<Card className="mt-6">
				<TabGroup>
						<TabList>
								<Tab>All Transactions ({processResult.processed})</Tab>
								<Tab>
										<div className="flex items-center">
												Rejected ({processResult.rejected})
												{processResult.rejected > 0 && (
														<span className="ml-2 w-2 h-2 bg-red-500 rounded-full" />
												)}
										</div>
								</Tab>
						</TabList>
						<TabPanels>
								<TabPanel>
										<Text className="mt-4"></Text>
								</TabPanel>
								<TabPanel>
										{rejectedTransactions.length > 0 ? (
												<Table className="mt-5">
														<TableHead>
																<TableRow>
																<TableHeaderCell>Original Record</TableHeaderCell>
																<TableHeaderCell>Rejection Reason</TableHeaderCell>
																</TableRow>
														</TableHead>
														<TableBody>
																{rejectedTransactions.map((item) => (
																<TableRow key={item.id}>
																		<TableCell className="font-mono text-xs whitespace-pre-wrap break-all">{item.originalRecord}</TableCell>
																		<TableCell>
																		<Badge>{item.rejectionReason}</Badge>
																		</TableCell>
																</TableRow>
																))}
														</TableBody>
												</Table>
										) : (
												<Text className="mt-4">No rejected transactions to display.</Text>
										)}
								</TabPanel>
						</TabPanels>
				</TabGroup>
		</Card>
	);
}
