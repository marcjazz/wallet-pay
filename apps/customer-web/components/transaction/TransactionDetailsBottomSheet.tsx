import { CybridTransactionEntity } from '../../api/types';
import RemittanceDetail from '../remittance/details/RemittanceDetail';
import BottomSheet from '../shared/BottomSheet';

interface TransactionDetailsBottomSheetProps {
  closeBottomSheet: () => void;
  selectedTransaction: CybridTransactionEntity;
}
export default function TransactionDetailsBottomSheet({
  closeBottomSheet,
  selectedTransaction,
}: TransactionDetailsBottomSheetProps) {
  return (
    <BottomSheet
      open={!!selectedTransaction}
      closeBottomSheet={closeBottomSheet}
    >
      <RemittanceDetail transaction={selectedTransaction} />
    </BottomSheet>
  );
}
