import { BigInt, ethereum } from '@graphprotocol/graph-ts';
import { BidEntity } from '../../generated/schema';
import { getBid } from '../utils/pawn-shop.contract';
import { loadOrCreatePosition } from './position';

export function loadOrCreateBid(bidId: BigInt, block: ethereum.Block): BidEntity | null {
  let bid = BidEntity.load(`${bidId.toString()}`)
  if (!bid) {
    const bidResult = getBid(bidId);

    if (bidResult != null) {
      const position = loadOrCreatePosition(bidResult.posId, block);
      if (position != null) {
        bid = new BidEntity(`${bidId.toString()}`);
        bid.position = position.id
        bid.lender = bidResult.lender.toHex()
        bid.amount = bidResult.amount
        bid.open = bidResult.open
        bid.createAtBlock = block.number
        bid.timestamp = block.timestamp
        bid.save()
        return bid;
      }
    }
    return null;
  }

  return bid;
}