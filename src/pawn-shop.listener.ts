import {
  AuctionBidAccepted,
  AuctionBidClosed,
  AuctionBidOpened,
  BidExecuted,
  PositionClaimed,
  PositionClosed,
  PositionOpened,
  PositionRedeemed,
  UpdateController
} from "../generated/PawnShopContract/PawnShopContract"
import { loadOrCreatePosition } from './types/position';
import { loadOrCreatePositionAction } from './types/position-action';
import { ActionType } from './utils/constant';
import { loadOrCreateBid } from './types/bid';
import { loadOrCreateBidAction } from './types/bid-action';

export function handlePositionOpened(event: PositionOpened): void {
  const position = loadOrCreatePosition(event.params.posId, event.block);
  if (position) {
    loadOrCreatePositionAction(position.id, 'OPEN_POSITION', event.block, event.transaction);
  }
}

export function handlePositionClosed(event: PositionClosed): void {
  const position = loadOrCreatePosition(event.params.posId, event.block);
  if (position) {
    loadOrCreatePositionAction(position.id, 'CLOSE_POSITION', event.block, event.transaction);
    position.open = false;
    position.save();
  }
}

export function handleAuctionBidOpened(event: AuctionBidOpened): void {
  const position = loadOrCreatePosition(event.params.posId, event.block);
  if (position) {
    loadOrCreatePositionAction(position.id, 'BID_OPEN', event.block, event.transaction);
    const bid = loadOrCreateBid(event.params.bidId, event.block);
    if (bid) {
      const bidAction = loadOrCreateBidAction(bid.id, event.transaction, event.block);
    }
  }
}

export function handleAuctionBidAccepted(event: AuctionBidAccepted): void {
  const position = loadOrCreatePosition(event.params.posId, event.block);
  if (position) {
    loadOrCreatePositionAction(position.id, 'BID_ACCEPT', event.block, event.transaction);
    const bid = loadOrCreateBid(event.params.bidId, event.block);
    if (bid) {
      const bidAction = loadOrCreateBidAction(bid.id, event.transaction, event.block);
      bidAction.action = 'BID_ACCEPT';
      bidAction.save();
    }
  }
}

export function handleAuctionBidClosed(event: AuctionBidClosed): void {
  const position = loadOrCreatePosition(event.params.posId, event.block);
  if (position) {
    loadOrCreatePositionAction(position.id, 'BID_CLOSE', event.block, event.transaction);
    const bid = loadOrCreateBid(event.params.bidId, event.block);
    if (bid) {
      bid.open = false;
      bid.save();
      const bidAction = loadOrCreateBidAction(bid.id, event.transaction, event.block);
      bidAction.action = 'BID_CLOSE';
      bidAction.save();
    }
  }
}
// EXECUTE SALE
export function handleBidExecuted(event: BidExecuted): void {
  const position = loadOrCreatePosition(event.params.posId, event.block);
  if (position) {
    loadOrCreatePositionAction(position.id, 'BID_EXECUTE', event.block, event.transaction);
  }
}

export function handlePositionClaimed(event: PositionClaimed): void {
  const position = loadOrCreatePosition(event.params.posId, event.block);
  if (position) {
    loadOrCreatePositionAction(position.id, 'CLAIM_POSITION', event.block, event.transaction);
  }
}

export function handlePositionRedeemed(event: PositionRedeemed): void {
  const position = loadOrCreatePosition(event.params.posId, event.block);
  if (position) {
    loadOrCreatePositionAction(position.id, 'REDEEM_POSITION', event.block, event.transaction);
  }
}

export function handleUpdateController(event: UpdateController): void {}
