import { RemittanceTransaction } from '../../app/remittance/page';
import RemittanceDetail from '../remittance/details/RemittanceDetail';
import BottomSheet from '../shared/BottomSheet';

interface TransactionDetailsBottomSheetProps {
  closeBottomSheet: () => void;
  selectedTransaction: RemittanceTransaction;
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
