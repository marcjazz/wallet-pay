import { useCallback } from 'react';
import {
  PlaidLinkOnSuccess,
  PlaidLinkOnSuccessMetadata,
  PlaidLinkOptions,
  usePlaidLink,
} from 'react-plaid-link';
import { useCreateExternalAccount } from '../../api/hooks/useAccounts';
import { Currency } from '../../api/types';
import { errorHandling } from '../shared/errorHandling';
import { useIntl } from 'react-intl';

export default function Plaid({
  plaidPublicToken,
  handleSuccess,
}: {
  plaidPublicToken: string;
  handleSuccess: () => void;
}) {
  const { mutate: createExternalAccount } = useCreateExternalAccount();
  const { formatMessage } = useIntl();

  const onSuccess = useCallback<PlaidLinkOnSuccess>(
    (
      public_token: string,
      { accounts: [account] }: PlaidLinkOnSuccessMetadata
    ) => {
      createExternalAccount(
        {
          plaid_account_name: account.name,
          plaid_public_token: public_token,
          currency: Currency.USD,
          plaid_account_id: account.id,
          plaid_account_mask: account.mask,
        },
        {
          onSuccess: () => handleSuccess(),
          onError: (error) => errorHandling({ error, formatMessage }),
        }
      );
    },
    [createExternalAccount, formatMessage, handleSuccess]
  );

  // The usePlaidLink hook manages Plaid Link creation
  // It does not return a destroy function;
  // instead, on unmount it automatically destroys the Link instance
  const config: PlaidLinkOptions = {
    onSuccess,
    onExit: (err, metadata) => {
      console.log({ err, metadata });
    },
    token: plaidPublicToken,
  };

  const { open, ready } = usePlaidLink(config);

  if (ready) {
    open();
  }

  return <></>;
}
