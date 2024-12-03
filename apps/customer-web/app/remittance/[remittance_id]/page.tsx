'use client';

// import { useParams } from 'next/navigation';
import { useTransaction } from 'apps/customer-web/api/hooks/useTransaction';
import { useParams } from 'next/navigation';
import { useEffect } from 'react';
import RemittanceDetail from '../../../components/remittance/details/RemittanceDetail';

export default function RemittanceDetails() {
  const params = useParams();
  // const [isTransactionLoading, setIsTransactionLoading] = useState(true);
  // const [transaction, setTransaction] = useState<
  //   RemittanceTransaction | undefined
  // >();

  const { data: transaction, isLoading: isTransactionLoading } = useTransaction(
    params['remittance_id'] as string
  );

  useEffect(() => {
    // setIsTransactionLoading(true);
    //TODO: CALL API TO FETCH REMITTANCE TRANSACTION with remittance_id
    // TODO: if there's no data, redirect to home
    // setTimeout(() => {
    // setIsTransactionLoading(false);
    // setTransaction({
    //   cybrid_transaction_id: '1',
    //   amount_sent: 50,
    //   amount_received: 28.98,
    //   exchange_rate: 600,
    //   transaction_fee: 2,
    //   payout_method: SupportedPayoutMethod.cash,
    //   receiver: {
    //     fullname: 'John Doe',
    //     phone_number: '678123456',
    //     national_id_number: '123456789',
    //     bank_name: 'Cameroon Bank',
    //     IBAN: 'CM1234567000031754146934864',
    //     receiver_payout_info_id: '1',
    //   },
    //   status: TransactionStatus.SETTLED,
    //   initial_currency: CurrencyEnum.USD,
    //   initiated_at: '2021-10-10 12:00:00',
    //   settled_at: '2021-10-10 12:00:00',
    // });
    // }, 3000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <RemittanceDetail
      transaction={transaction}
      isTransactionLoading={isTransactionLoading}
    />
  );
}
