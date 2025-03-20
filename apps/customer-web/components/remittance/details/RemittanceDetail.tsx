import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  Skeleton,
  Tooltip,
  Typography,
} from '@mui/material';
import { useTheme } from '@xafpay/theme';
import { useExternalAccounts } from 'apps/customer-web/api/hooks/useAccounts';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  ArrowDown,
  ArrowUpRight,
  CheckCircle,
  ChevronLeft,
  RefreshCcw,
  X,
} from 'react-feather';
import { useIntl } from 'react-intl';
import { useReceiver } from '../../../api/hooks/useReciever';
import {
  CybridTransactionEntity,
  TransactionStatus,
  TransactionType,
  VerificationStatus,
} from '../../../api/types';
import { SupportedPayoutMethod } from '../amount/SendAmountStep';
import ReceiptLine from '../receipt/ReceiptLine';
import RemittanceDetailSkeleton from './RemittanceDetailSkeleton';

interface RemittanceDetailProps {
  transaction?: CybridTransactionEntity;
  isTransactionLoading?: boolean;
  fromBottomSheet?: boolean;
}
export default function RemittanceDetail({
  transaction,
  isTransactionLoading = false,
  fromBottomSheet = true,
}: RemittanceDetailProps) {
  const { formatMessage, formatDate, formatNumber } = useIntl();
  const theme = useTheme();
  const { push } = useRouter();

  const { data: receiver, isFetching: isReceiverLoading } = useReceiver(
    transaction?.receiver_payout_info_id as string
  );
  const { data: externalAccounts, isFetching: isLoadingExternalAccounts } =
    useExternalAccounts(VerificationStatus.PASSED);

  const receiptHeader: Record<
    TransactionStatus,
    { image: JSX.Element; title: string }
  > = {
    FAILED: {
      image: <AlertCircle color={theme.palette.error.main} size="76" />,
      title: formatMessage({ id: 'failed' }),
    },
    PENDING: {
      image: <RefreshCcw color="black" size="76" />,
      title: formatMessage({ id: 'pending' }),
    },
    REVIEWING: {
      image: <RefreshCcw color="black" size="76" />,
      title: formatMessage({ id: 'pending' }),
    },
    STORING: {
      image: <RefreshCcw color="black" size="76" />,
      title: formatMessage({ id: 'pending' }),
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
      title: formatMessage({ id: 'successful' }),
    },
  };
  return isTransactionLoading || !transaction ? (
    <RemittanceDetailSkeleton />
  ) : (
    <Box
      sx={{
        padding: 2,
        display: 'grid',
        gridTemplateRows: fromBottomSheet ? '1fr' : 'auto 1fr',
        rowGap: 1,
        overflow: 'clip',
        position: 'relative',
      }}
    >
      <Image
        src="/assets/logo.svg"
        alt="Xafpay Logo"
        width={320}
        height={320}
        style={{
          position: 'absolute',
          bottom: -50,
          right: -36,
          opacity: 0.1,
        }}
      />
      {!fromBottomSheet && (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'auto 1fr',
            alignItems: 'center',
            columnGap: 2,
            marginBottom: 2,
          }}
        >
          <Tooltip title={formatMessage({ id: 'back' })}>
            <IconButton
              size="small"
              onClick={() => push('/')}
              sx={{
                padding: 0,
              }}
            >
              <ChevronLeft color="#1F2223" />
            </IconButton>
          </Tooltip>

          <Typography variant="h3">
            {formatMessage({ id: 'transactionDetails' })}
          </Typography>
        </Box>
      )}
      <Box sx={{ display: 'grid', rowGap: 1 }}>
        <Box>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              columnGap: 2,
              alignItems: 'center',
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
              <Image
                src="/assets/logo.svg"
                alt="Xafpay Logo"
                width={50}
                height={50}
              />
              <Typography variant="h1">XAFPAY</Typography>
            </Box>

            <Button
              variant="outlined"
              size="small"
              onClick={() => window.print()}
            >
              {formatMessage({ id: 'downloadReceipt' })}
            </Button>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              columnGap: 2,
              alignItems: 'center',
              padding: '10px',
              backgroundColor: '#f5f5f5',
              borderRadius: '10px',
              marginTop: '10px',
            }}
          >
            <Box
              sx={{
                display: 'grid',
                justifyItems: 'start',
              }}
            >
              <Typography variant="p1r" color={theme.palette.primary.dark}>
                {formatMessage({ id: 'transactionId' })}
              </Typography>
              <Typography
                variant="p1r"
                sx={{ color: theme.palette.secondary.dark }}
              >
                {transaction.transaction_id}
              </Typography>
            </Box>

            <Box
              sx={{
                display: 'grid',
                justifyItems: 'end',
              }}
            >
              <Typography>
                {formatDate(transaction.initiated_at, {
                  year: '2-digit',
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: 'numeric',
                })}
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'auto 1fr',
                  columnGap: 0.5,
                  alignItems: 'center',
                }}
              >
                <Avatar
                  sx={{
                    bgcolor:
                      transaction.transaction_type ===
                      TransactionType.INSTANT_FUNDING
                        ? theme.palette.secondary.main
                        : theme.palette.primary.dark,
                    height: '20px',
                    width: '20px',
                  }}
                >
                  {transaction.transaction_type ===
                  TransactionType.INSTANT_FUNDING ? (
                    <ArrowDown size={15} color="white" />
                  ) : (
                    <ArrowUpRight size={15} color="white" />
                  )}
                </Avatar>
                <Typography variant="p1r">
                  {formatMessage({ id: transaction.transaction_type })}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        {transaction.transaction_type === TransactionType.INSTANT_FUNDING ? (
          <Box sx={{ display: 'grid', rowGap: 2 }}>
            <ReceiptLine
              title={formatMessage({ id: 'debitAccount' })}
              value={
                externalAccounts?.find(
                  (account) =>
                    account.cybrid_external_account_id ===
                    transaction.cybrid_external_account_id
                )?.name ?? ''
              }
              isLoading={isLoadingExternalAccounts}
            />
            <ReceiptLine
              title={formatMessage({ id: 'amount' })}
              value={formatNumber(transaction.initial_currency_amount, {
                currency: transaction.initial_currency as string,
                style: 'currency',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            />
            <ReceiptLine
              title={formatMessage({ id: 'transactionFees' })}
              value={formatNumber(transaction.fees, {
                currency: transaction.initial_currency as string,
                style: 'currency',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            />
            <ReceiptLine
              title={formatMessage({ id: 'totalDebit' })}
              value={formatNumber(
                transaction.initial_currency_amount + transaction.fees,
                {
                  currency: transaction.initial_currency as string,
                  style: 'currency',
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }
              )}
            />
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'auto 1fr',
                columnGap: 1,
                alignItems: 'center',
                justifyItems: 'end',
              }}
            >
              <Typography variant="p2m">
                {formatMessage({ id: 'transactionStatus' })}
              </Typography>
              <Chip
                label={receiptHeader[transaction.status].title}
                color={
                  transaction.status === TransactionStatus.COMPLETED
                    ? 'primary'
                    : transaction.status === TransactionStatus.FAILED
                    ? 'error'
                    : 'default'
                }
                size="small"
                icon={
                  transaction.status === TransactionStatus.COMPLETED ? (
                    <CheckCircle size={13} color="white" />
                  ) : transaction.status === TransactionStatus.FAILED ? (
                    <X size={13} color="white" />
                  ) : (
                    <RefreshCcw color="black" size={13} />
                  )
                }
              />
            </Box>
          </Box>
        ) : (
          <Box sx={{ display: 'grid', rowGap: 2 }}>
            <ReceiptLine
              title={formatMessage({ id: 'amount' })}
              value={formatNumber(transaction.initial_currency_amount, {
                currency: transaction.initial_currency as string,
                style: 'currency',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            />
            <ReceiptLine
              title={formatMessage({ id: 'transactionFees' })}
              value={formatNumber(transaction.fees, {
                currency: transaction.initial_currency as string,
                style: 'currency',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            />
            <ReceiptLine
              title={formatMessage({ id: 'totalDebit' })}
              value={formatNumber(
                transaction.initial_currency_amount + transaction.fees,
                {
                  currency: transaction.initial_currency as string,
                  style: 'currency',
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }
              )}
            />
            <ReceiptLine
              title={formatMessage({ id: 'conversionRate' })}
              value={`1 ${transaction.initial_currency} = ${
                transaction.conversion_rate ?? 1
              } XAF`}
            />
            <ReceiptLine
              title={formatMessage({ id: 'totalPaidOut' })}
              value={formatNumber(
                Math.floor(
                  (transaction.initial_currency_amount + transaction.fees) *
                    (transaction.conversion_rate ?? 1)
                ),
                {
                  currency: 'xaf',
                  style: 'currency',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                }
              )}
            />
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'auto 1fr',
                columnGap: 1,
                alignItems: 'center',
                justifyItems: 'end',
              }}
            >
              <Typography variant="p2m">
                {formatMessage({ id: 'transactionStatus' })}
              </Typography>
              <Chip
                label={receiptHeader[transaction.status].title}
                color={
                  transaction.status === TransactionStatus.COMPLETED
                    ? 'primary'
                    : transaction.status === TransactionStatus.FAILED
                    ? 'error'
                    : 'default'
                }
                size="small"
                icon={
                  transaction.status === TransactionStatus.COMPLETED ? (
                    <CheckCircle size={13} color="white" />
                  ) : transaction.status === TransactionStatus.FAILED ? (
                    <X size={13} color="white" />
                  ) : (
                    <RefreshCcw color="black" size={13} />
                  )
                }
              />
            </Box>
          </Box>
        )}

        {transaction.transaction_type === TransactionType.REMITTANCE && (
          <Divider sx={{ justifySelf: 'stretch' }} />
        )}

        {transaction &&
          (transaction.transaction_type === TransactionType.REMITTANCE ||
            !!transaction.settled_at) && (
            <Box sx={{ display: 'grid', rowGap: 2 }}>
              {transaction.transaction_type === TransactionType.REMITTANCE && (
                <>
                  <Typography variant="p1m" color="#B1ACA5">
                    {formatMessage({ id: 'transferDestination' })}
                  </Typography>
                  <ReceiptLine
                    title={formatMessage({ id: 'receiver' })}
                    value={receiver?.fullname as string}
                  />
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
                      value={receiver.phone_number.replace(
                        /(.{3})(?=.)/g,
                        '$1 '
                      )}
                    />
                  )}
                  <ReceiptLine
                    title={formatMessage({ id: 'payoutMethod' })}
                    value={formatMessage({ id: SupportedPayoutMethod.mobile })}
                  />
                </>
              )}
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
          )}
      </Box>
      <Divider sx={{ justifySelf: 'stretch' }} />
      <Box sx={{ display: 'grid', rowGap: 1 }}>
        <Typography variant="p3r" sx={{ display: 'block' }}>
          XAFPAY LLC is a registered Money Services Business (MSB), conforming
          to the Bank Secrecy Act (BSA) regulations at 31 CFR 1022.30(a)-(f),
          with MSB registration number 31000278910659 administered by the
          Financial Crimes Enforcement Network (FinCEN).
        </Typography>
        <Typography variant="p3r" sx={{ display: 'block' }}>
          XAFPAY LLC, formed in the USA - state of Montana, with Certified File
          Number C1446980 - 16217942, headquarter 1001 S. Main Str. STE 600
          Kalispell, MT 59901, USA.
        </Typography>
        <Typography variant="p3r" sx={{ display: 'block' }}>
          XAFPAY LLC, is a partner of Cybrid.xyz
        </Typography>
      </Box>
    </Box>
  );
}
