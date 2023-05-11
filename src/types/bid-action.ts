import { ethereum } from '@graphprotocol/graph-ts';
import { BidActionEntity } from '../../generated/schema';

export function loadOrCreateBidAction(bidId: string, tx: ethereum.Transaction, block: ethereum.Block): BidActionEntity {
  const id = `${bidId}-${tx.hash.toHex()}`
  let bidAction = BidActionEntity.load(id);
  if (!bidAction) {
    bidAction = new BidActionEntity(id);

    bidAction.bid = bidId;
    bidAction.action = 'BID_OPEN';

    bidAction.timestamp = block.timestamp
    bidAction.createAtBlock = block.number
    bidAction.save();
  }

  return bidAction;
}