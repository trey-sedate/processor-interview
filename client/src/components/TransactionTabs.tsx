import { Card, Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow, Badge, Title, Text } from '@tremor/react';
import { useTransactionStore } from '../store/transactionStore';

export function TransactionTabs() {
    const { rejectedTransactions, processResult } = useTransactionStore();

    if (!processResult) {
        return null;
    }

    return (
        <Card className="mt-6">
            <Title>Rejected Transactions ({processResult.rejected})</Title>
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
                                <TableCell className="font-mono text-xs whitespace-pre-wrap break-all">
                                    {item.originalRecord}
                                </TableCell>
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
        </Card>
    );
}
