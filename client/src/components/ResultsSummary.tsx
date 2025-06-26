import { Card, Flex, Icon, Title, Text } from '@tremor/react';
import { CheckCircleIcon, ExclamationCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import { useTransactionStore } from '../store/transactionStore';

export function ResultsSummary() {
		const { processResult, error } = useTransactionStore();

		if (error) {
			return (
					<Card className="mt-6" decoration="top" decorationColor="red">
							<Flex alignItems="center">
									<Title>Error</Title>
									<Icon icon={ExclamationCircleIcon} color="red" size="lg" />
							</Flex>
							<Text className="mt-2 text-red-700">{error}</Text>
					</Card>
			);
		}

		if (!processResult) {
				return null;
		}

		const hasRejections = processResult.rejected > 0;
		const isAllFailed = processResult.processed === 0 && processResult.rejected > 0;

		return (
			<Card
					className="mt-6"
					decoration="top"
					decorationColor={isAllFailed ? "red" : hasRejections ? "amber" : "emerald"}
			>
					<Flex alignItems="center">
							<Title>Processing Complete</Title>
							<Icon
									icon={isAllFailed ? XCircleIcon : hasRejections ? ExclamationCircleIcon : CheckCircleIcon}
									color={isAllFailed ? "red" : hasRejections ? "amber" : "emerald"}
									size="lg"
							/>
					</Flex>
					<Text className="mt-2">
							Succeeded: {processResult.processed} | Failed: {processResult.rejected}
					</Text>
			</Card>
		);
}