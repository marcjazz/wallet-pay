import { Box, Divider, Skeleton, Typography } from '@mui/material';
import { useTheme } from '@xafpay/theme';
import { useReceiver } from 'apps/customer-web/api/hooks/useReciever';
import Image from 'next/image';
import { AlertCircle, RefreshCcw } from 'react-feather';
import { useIntl } from 'react-intl';
import { CybridTransactionEntity, TransactionStatus } from '../../../api/types';
import { SupportedPayoutMethod } from '../amount/SendAmountStep';
import ReceiptLine from '../receipt/ReceiptLine';
import RemittanceDetailSkeleton from './RemittanceDetailSkeleton';

interface RemittanceDetailProps {
  transaction?: CybridTransactionEntity;
  isTransactionLoading?: boolean;
}
export default function RemittanceDetail({
  transaction,
  isTransactionLoading = false,
}: RemittanceDetailProps) {
  const { formatMessage, formatDate, formatNumber } = useIntl();
  const theme = useTheme();

  const { data: receiver, isFetching: isReceiverLoading } = useReceiver(
    transaction?.receiver_payout_info_id as string
  );

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
    REVIEWING: {
      image: <RefreshCcw color="black" size="76" />,
      title: formatMessage({ id: 'transferPending' }),
    },
    STORING: {
      image: <RefreshCcw color="black" size="76" />,
      title: formatMessage({ id: 'transferPending' }),
    },
    COMPLETED: {
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
  return isTransactionLoading || !transaction ? (
    <RemittanceDetailSkeleton />
  ) : (
    <Box sx={{ padding: 2, display: 'grid', rowGap: 6 }}>
      <Box sx={{ display: 'grid', justifyItems: 'center', rowGap: 4 }}>
        <Box sx={{ display: 'grid', justifyItems: 'center', rowGap: 2 }}>
          {receiptHeader[transaction.status].image}
          <Typography variant="h2">
            {receiptHeader[transaction.status].title}
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
                {formatNumber(
                  transaction.amount * (transaction.conversion_rate ?? 1),
                  {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }
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
                {transaction.initial_currency}
              </Typography>
              <Typography variant="h4" color="#B1ACA5">
                {formatNumber(transaction.amount, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Typography>
            </Box>
          </Box>
          <Typography variant="l3r" color="#BABDBE">
            {`1 ${transaction.initial_currency} = ${
              transaction.conversion_rate ?? 1
            } XAF`}
          </Typography>
          <Typography variant="p3r">
            {`${formatMessage({ id: 'transactionFee' })}: ${
              transaction.initial_currency
            } ${formatNumber(transaction.fees, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`}
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
              value={transaction.cybrid_transaction_id}
            />
            <ReceiptLine
              title={formatMessage({ id: 'receiver' })}
              value={receiver?.fullname as string}
            />
            {/* add the details of the receiver. phone number, network, nid, bank name, account number */}
            {
              // transaction.payout_method === SupportedPayoutMethod.bank ? (
              //   <>
              //     <ReceiptLine
              //       title={formatMessage({ id: 'bankName' })}
              //       value={(transaction.receiver as BankReceiver).bank_name}
              //     />
              //     <ReceiptLine
              //       title={formatMessage({ id: 'IBAN' })}
              //       value={(transaction.receiver as BankReceiver).IBAN.replace(
              //         /^([A-Z]{2})(\d{2})(\d{5})(\d{5})(\d{11})(\d{2})$/,
              //         '$1$2 $3 $4 $5 $6'
              //       )}
              //     />
              //   </>
              // ) :
              <>
                {isReceiverLoading || !receiver ? (
                  <Typography variant="p1r">
                    <Skeleton
                      sx={{
                        minWidth: '100px',
                        backgroundColor: 'rgb(179 167 167 / 12%)',
                      }}
                    />
                  </Typography>
                ) : (
                  <ReceiptLine
                    title={formatMessage({ id: 'phoneNumber' })}
                    value={receiver.phone_number.replace(/(.{3})(?=.)/g, '$1 ')}
                  />
                )}
                {/* {transaction.payout_method === SupportedPayoutMethod.cash && (
                  <ReceiptLine
                    title={formatMessage({ id: 'nationalIdNumber' })}
                    value={
                      (transaction.receiver as MomoReceiver).national_id_number
                    }
                  />
                )} */}
              </>
            }
            <ReceiptLine
              title={formatMessage({ id: 'payoutMethod' })}
              value={formatMessage({ id: SupportedPayoutMethod.mobile })}
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
        </Box>
      )}
    </Box>
  );
}
