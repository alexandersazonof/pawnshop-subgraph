import { BigInt, ethereum } from '@graphprotocol/graph-ts';
import { FeeEarnedEntity, FeeEarnedHistoryEntity } from '../../generated/schema';

export function addFeeAmount(positionId: string, feeAmount: BigInt, block: ethereum.Block): void {
  const id = '1';
  let feeTotal = FeeEarnedEntity.load(id);
  if (!feeTotal) {
    feeTotal = new FeeEarnedEntity(id);
    feeTotal.value = BigInt.zero();
    feeTotal.save();
  }

  const historyId = `${positionId}-${block.number}`
  let feeHistory = FeeEarnedHistoryEntity.load(historyId);
  if (!feeHistory) {
    feeHistory = new FeeEarnedHistoryEntity(historyId);
    feeHistory.feeAmount = feeAmount;
    feeHistory.position = positionId;
    feeHistory.createAtBlock = block.number;
    feeHistory.timestamp = block.timestamp;
    feeHistory.save()
  }
}