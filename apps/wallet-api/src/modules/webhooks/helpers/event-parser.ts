import { CybridTransactionStatus, PrismaClient } from '@prisma/client';
import { CybridSubscriptionEventObjectDto } from '../dtos/cybrid-subscription.dto';
import { Logger } from '@nestjs/common';

export async function parseEventObject(
  eventObject: CybridSubscriptionEventObjectDto,
  deps: {
    prisma: PrismaClient;
    logger: Logger;
  }
) {
  const {
    guid,
    event_type: eventType,
    object_guid: transactionGuid,
  } = eventObject;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, status] = eventType.split('.');
  const transactionStatus = (
    status === 'settling' ? 'reviewing' : status
  ).toLocaleUpperCase() as CybridTransactionStatus;

  const transaction = await deps.prisma.cybridTransaction.findFirst({
    include: { InitiatedBy: { select: { cybrid_customer_guid: true } } },
    where: {
      OR: [
        { cybrid_transaction_guid: transactionGuid },
        { cybrid_transfer_settlement_guid: transactionGuid },
      ],
    },
  });
  if (!transaction) {
    deps.logger.error(
      `No transaction record was found for ${transactionGuid}!`
    );
    return;
  }

  //  Do nothing if transaction status was already set to a final state
  if (transaction.status === 'COMPLETED' || transaction.status === 'FAILED') {
    deps.logger.log(
      `(event: ${eventType}, Guid: ${guid}) from cybrid was ignored because transaction was already in final state`
    );
    return;
  }

  return {
    transaction,
    transactionGuid,
    transactionStatus,
    customerGuid: transaction.InitiatedBy.cybrid_customer_guid,
  };
}
