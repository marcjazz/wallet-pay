'use client';

import { useParams } from 'next/navigation';
import { useTransaction } from '../../../api/hooks/useTransaction';
import RemittanceDetail from '../../../components/remittance/details/RemittanceDetail';

export default function RemittanceDetails() {
  const params = useParams();

  const { data: transaction, isLoading: isTransactionLoading } = useTransaction(
    params['remittance_id'] as string
  );

  return (
    <RemittanceDetail
      transaction={transaction}
      isTransactionLoading={isTransactionLoading}
      fromBottomSheet={false}
    />
  );
}
