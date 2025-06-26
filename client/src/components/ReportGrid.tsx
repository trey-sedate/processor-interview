import { AreaChart, Card, Col, DonutChart, Grid, Title, BarChart, Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell, List, ListItem} from '@tremor/react';
import { useTransactionStore } from '../store/transactionStore';

const currencyFormatter = (value: number) => `$${Intl.NumberFormat('us').format(value).toString()}`;

export function ReportGrid() {
	const { cardTypeSummary, dailySummary, cardSummary, processResult } = useTransactionStore();

	if (!processResult) return null;

	return (
		<Grid numItemsMd={2} numItemsLg={3} className="gap-6 mt-6">
			<Col numColSpanMd={2} numColSpanLg={2}>
				<Card>
					<Title>Volume by Card Type</Title>
					<BarChart
						className="mt-6"
						data={cardTypeSummary.map(item => ({...item, totalVolume: Number(item.totalVolume)}))}
						index="cardType"
						categories={['totalVolume']}
						colors={['blue']}
						valueFormatter={currencyFormatter}
						yAxisWidth={60}
					/>
				</Card>
			</Col>

			<Col numColSpanMd={2} numColSpanLg={3}>
					<Card>
							<Title>Summary by Card Number</Title>
							<Table className="mt-5">
									<TableHead>
											<TableRow>
													<TableHeaderCell>Card Number</TableHeaderCell>
													<TableHeaderCell>Card Type</TableHeaderCell>
													<TableHeaderCell>Total Volume</TableHeaderCell>
													<TableHeaderCell># Transactions</TableHeaderCell>
											</TableRow>
									</TableHead>
									<TableBody>
											{cardSummary.map((item) => (
													<TableRow key={item.cardNumber}>
															<TableCell>{item.cardNumber}</TableCell>
															<TableCell>{item.cardType}</TableCell>
															<TableCell>{currencyFormatter(item.totalVolume)}</TableCell>
															<TableCell>{item.transactionCount}</TableCell>
													</TableRow>
											))}
									</TableBody>
							</Table>
					</Card>
			</Col>

			<Col numColSpanMd={2} numColSpanLg={3}>
				<Card>
					<Title>Volume by Day</Title>
					<AreaChart
						className="mt-6 h-72"
						data={dailySummary.map(d => ({
								day: new Date(d.day).toLocaleDateString(),
								totalVolume: Number(d.totalVolume)
						}))}
						index="day"
						categories={['totalVolume']}
						colors={['indigo']}
						valueFormatter={currencyFormatter}
						yAxisWidth={60}
					/>
				</Card>
			</Col>
		</Grid>
	);
}