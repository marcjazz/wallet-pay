'use client';

import { Box, Button, Divider, Skeleton, Typography } from '@mui/material';
import { useTheme } from '@xafpay/theme';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AlertCircle, RefreshCcw } from 'react-feather';
import { useIntl } from 'react-intl';
import { CurrencyEnum } from '../../../components/Home/MainCard';
import { SupportedPayoutMethod } from '../../../components/remittance/amount/SendAmountStep';
import ReceiptLine from '../../../components/remittance/receipt/ReceiptLine';
import {
  BankReceiver,
  MomoReceiver,
  Receiver,
} from '../../../components/remittance/receiver/ReceiverStep';

export enum TransactionStatus {
  PENDING = 'PENDING',
  SETTLED = 'SETTLED',
  FAILED = 'FAILED',
}

export interface RemittanceTransaction {
  cybrid_transaction_id: string;
  amount_sent: number;
  amount_received: number;
  exchange_rate: number;
  transaction_fee: number;
  receiver: Receiver;
  status: TransactionStatus;
  initial_currency: CurrencyEnum;
  payout_method: SupportedPayoutMethod;
  initiated_at: string;
  settled_at?: string;
}

interface RemittanceDetailsProps {
  transaction?: RemittanceTransaction;
}
export default function RemittanceDetails({
  transaction: fullTransaction,
}: RemittanceDetailsProps) {
  const params = useParams();
  const { push } = useRouter();
  const { formatMessage, formatNumber, formatDate } = useIntl();
  const theme = useTheme();

  const [transaction, setTransaction] = useState<
    RemittanceTransaction | undefined
  >(fullTransaction);
  const [isTransactionLoading, setIsTransactionLoading] = useState(true);
  useEffect(() => {
    if (!fullTransaction) {
      setIsTransactionLoading(true);
      const remittance_id = params['remittance_id'];
      //TODO: CALL API TO FETCH REMITTANCE TRANSACTION with remittance_id
      // TODO: if there's no data, redirect to home
      setTimeout(() => {
        setIsTransactionLoading(false);
        setTransaction({
          cybrid_transaction_id: '1',
          amount_sent: 50,
          amount_received: 28.98,
          exchange_rate: 600,
          transaction_fee: 2,
          payout_method: SupportedPayoutMethod.cash,
          receiver: {
            fullname: 'John Doe',
            phone_number: '678123456',
            national_id_number: '123456789',
            bank_name: 'Cameroon Bank',
            IBAN: 'CM1234567000031754146934864',
            receiver_payout_info_id: '1',
          },
          status: TransactionStatus.SETTLED,
          initial_currency: CurrencyEnum.USD,
          initiated_at: '2021-10-10 12:00:00',
          settled_at: '2021-10-10 12:00:00',
        });
      }, 3000);
    } else {
      setIsTransactionLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const receiptHeader: Record<
    TransactionStatus,
    { image: JSX.Element; title: string }
  > = {
    FAILED: {
      image: <AlertCircle color={theme.palette.error.main} size="76" />,
      title: formatMessage({ id: 'transferFailed' }),
    },
    PENDING: {
      image: <RefreshCcw color="black" size="76" />,
      title: formatMessage({ id: 'transferPending' }),
    },
    SETTLED: {
      image: (
        <Image
          src="/assets/remittance_success.svg"
          alt="Transfer Successful"
          width={76}
          height={76}
        />
      ),
      title: formatMessage({ id: 'transferSuccessful' }),
    },
  };

  return (
    <Box sx={{ padding: 2, display: 'grid', rowGap: 6 }}>
      <Box sx={{ display: 'grid', justifyItems: 'center', rowGap: 4 }}>
        <Box sx={{ display: 'grid', justifyItems: 'center', rowGap: 2 }}>
          {isTransactionLoading || !transaction ? (
            <Skeleton variant="circular" height={76} width={76} />
          ) : (
            receiptHeader[transaction.status].image
          )}
          <Typography variant="h2">
            {isTransactionLoading || !transaction ? (
              <Skeleton width={237} />
            ) : (
              receiptHeader[transaction.status].title
            )}
          </Typography>
        </Box>

        <Box sx={{ display: 'grid', justifyItems: 'center', rowGap: 1 }}>
          <Box
            sx={{
              display: 'grid',
              justifyItems: 'center',
              rowGap: 0.5,
            }}
          >
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'auto 1fr',
                columnGap: 0.5,
                alignItems: 'center',
              }}
            >
              <Typography variant="h5" color="#C8CDD0">
                XAF
              </Typography>
              <Typography variant="h1">
                {isTransactionLoading || !transaction ? (
                  <Skeleton width={50} />
                ) : (
                  formatNumber(transaction.amount_received, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })
                )}
              </Typography>
            </Box>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'auto 1fr',
                columnGap: 0.5,
                alignItems: 'center',
              }}
            >
              <Typography variant="h6" color="#C8CDD0">
                {isTransactionLoading || !transaction ? (
                  <Skeleton width={50} />
                ) : (
                  transaction.initial_currency
                )}
              </Typography>
              <Typography variant="h4" color="#B1ACA5">
                {isTransactionLoading || !transaction ? (
                  <Skeleton width={50} />
                ) : (
                  formatNumber(transaction.amount_sent, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })
                )}
              </Typography>
            </Box>
          </Box>
          <Typography variant="l3r" color="#BABDBE">
            {isTransactionLoading ? (
              <Skeleton width={50} />
            ) : (
              `1 ${transaction?.initial_currency} = ${transaction?.exchange_rate} XAF`
            )}
          </Typography>
          <Typography variant="p3r">
            {isTransactionLoading || !transaction ? (
              <Skeleton width={50} />
            ) : (
              `${formatMessage({ id: 'transactionFee' })}: ${
                transaction.initial_currency
              } ${formatNumber(transaction.transaction_fee, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`
            )}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ justifySelf: 'stretch' }} />

      {transaction && (
        <Box sx={{ display: 'grid', rowGap: 4 }}>
          <Box sx={{ display: 'grid', rowGap: 2 }}>
            <Typography variant="p1m" color="#B1ACA5">
              {formatMessage({ id: 'transferDestination' })}
            </Typography>
            <ReceiptLine
              title={formatMessage({ id: 'transactionId' })}
              value={params['remittance_id'] as string}
            />
            <ReceiptLine
              title={formatMessage({ id: 'receiver' })}
              value={transaction.receiver.fullname}
            />
            {/* add the details of the receiver. phone number, network, nid, bank name, account number */}
            {transaction.payout_method === SupportedPayoutMethod.bank ? (
              <>
                <ReceiptLine
                  title={formatMessage({ id: 'bankName' })}
                  value={(transaction.receiver as BankReceiver).bank_name}
                />
                <ReceiptLine
                  title={formatMessage({ id: 'IBAN' })}
                  value={(transaction.receiver as BankReceiver).IBAN.replace(
                    /^([A-Z]{2})(\d{2})(\d{5})(\d{5})(\d{11})(\d{2})$/,
                    '$1$2 $3 $4 $5 $6'
                  )}
                />
              </>
            ) : (
              <>
                <ReceiptLine
                  title={formatMessage({ id: 'phoneNumber' })}
                  value={(
                    transaction.receiver as MomoReceiver
                  ).phone_number.replace(/(.{3})(?=.)/g, '$1 ')}
                />
                {transaction.payout_method === SupportedPayoutMethod.cash && (
                  <ReceiptLine
                    title={formatMessage({ id: 'nationalIdNumber' })}
                    value={
                      (transaction.receiver as MomoReceiver).national_id_number
                    }
                  />
                )}
              </>
            )}
            <ReceiptLine
              title={formatMessage({ id: 'payoutMethod' })}
              value={formatMessage({ id: transaction.payout_method })}
            />
            <ReceiptLine
              title={formatMessage({ id: 'initiatedAt' })}
              value={formatDate(transaction.initiated_at, {
                year: '2-digit',
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
              })}
            />
            {transaction.settled_at && (
              <ReceiptLine
                title={formatMessage({ id: 'settledAt' })}
                value={formatDate(transaction.settled_at, {
                  year: '2-digit',
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: 'numeric',
                })}
              />
            )}
          </Box>
          {!fullTransaction && (
            <Button variant="text" onClick={() => push('/')}>
              {formatMessage({ id: 'backToHome' })}
            </Button>
          )}
        </Box>
      )}
    </Box>
  );
}
