import RemittanceDetails, {
  RemittanceTransaction,
} from '../../app/remittance/[remittance_id]/page';
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
      <RemittanceDetails transaction={selectedTransaction} />
    </BottomSheet>
  );
}
