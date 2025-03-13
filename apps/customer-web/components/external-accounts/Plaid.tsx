import { useCallback } from 'react';
import {
  PlaidLinkOnSuccess,
  PlaidLinkOnSuccessMetadata,
  PlaidLinkOptions,
  usePlaidLink,
} from 'react-plaid-link';
import { useCreateExternalAccount } from '../../api/hooks/useAccounts';
import { Currency } from '../../api/types';

export default function Plaid({
  plaidPublicToken,
  handleSuccess,
}: {
  plaidPublicToken: string;
  handleSuccess: () => void;
}) {
  const { mutate: createExternalAccount } = useCreateExternalAccount();

  const onSuccess = useCallback<PlaidLinkOnSuccess>(
    (public_token: string, metadata: PlaidLinkOnSuccessMetadata) => {
      createExternalAccount(
        {
          plaid_public_token: public_token,
          currency: Currency.USD,
          plaid_account_id: metadata.accounts[0].id,
          plaid_account_mask: metadata.accounts[0].mask,
        },
        {
          onSuccess: () => handleSuccess(),
          // TODO: USE alert in case of error. will be replaced with proper notifications later
          onError: (error) => alert(error.message),
        }
      );
    },
    [createExternalAccount, handleSuccess]
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
