import {
  AuctionBidAccepted,
  AuctionBidClosed,
  AuctionBidOpened,
  BidExecuted, PlatformFeeChanged,
  PositionClaimed,
  PositionClosed,
  PositionOpened,
  PositionRedeemed,
} from '../generated/PawnShopContract/PawnShopContract';
import { loadOrCreatePosition, toPositionExecutionEntity, updatePositionPrice } from './types/position';
import { loadOrCreatePositionAction } from './types/position-action';
import { loadOrCreateBid } from './types/bid';
import { loadOrCreateBidAction } from './types/bid-action';
import { loadOrCreatePawnshop } from './types/pawnshop';
import { DENOMINATOR } from './utils/constant';
import { PlaftformFeeHistoryEntity, PositionExecutionEntity, PositionInfoEntity } from '../generated/schema';
import { addFeeAmount } from './types/fee-amount';

export function handlePositionOpened(event: PositionOpened): void {
  loadOrCreatePawnshop(event.address, event.block);
  const position = loadOrCreatePosition(event.params.posId, event.block);
  if (position) {
    loadOrCreatePositionAction(position, 'OPEN_POSITION', event.block, event.transaction);
  }
}

export function handlePositionClosed(event: PositionClosed): void {
  loadOrCreatePawnshop(event.address, event.block);
  const position = loadOrCreatePosition(event.params.posId, event.block);
  if (position) {
    loadOrCreatePositionAction(position, 'CLOSE_POSITION', event.block, event.transaction);
    position.open = false;
    position.save();
    updatePositionPrice(position);
  }
}

export function handleAuctionBidOpened(event: AuctionBidOpened): void {
  loadOrCreatePawnshop(event.address, event.block);
  const position = loadOrCreatePosition(event.params.posId, event.block);
  if (position) {
    loadOrCreatePositionAction(position, 'BID_OPEN', event.block, event.transaction);
    const bid = loadOrCreateBid(event.params.bidId, event.block);
    if (bid) {
      const bidAction = loadOrCreateBidAction(bid.id, event.transaction, event.block);
    }
    updatePositionPrice(position);
  }
}

export function handleAuctionBidAccepted(event: AuctionBidAccepted): void {
  loadOrCreatePawnshop(event.address, event.block);
  const position = loadOrCreatePosition(event.params.posId, event.block);
  if (position) {
    loadOrCreatePositionAction(position, 'BID_ACCEPT', event.block, event.transaction);
    const bid = loadOrCreateBid(event.params.bidId, event.block);
    if (bid) {
      bid.open = false;
      bid.save();
      const bidAction = loadOrCreateBidAction(bid.id, event.transaction, event.block);
      bidAction.action = 'BID_ACCEPT';
      bidAction.save();
    }
    updatePositionPrice(position);
  }
}

export function handleAuctionBidClosed(event: AuctionBidClosed): void {
  loadOrCreatePawnshop(event.address, event.block);
  const position = loadOrCreatePosition(event.params.posId, event.block);
  if (position) {
    loadOrCreatePositionAction(position, 'BID_CLOSE', event.block, event.transaction);
    const bid = loadOrCreateBid(event.params.bidId, event.block);
    if (bid) {
      bid.open = false;
      bid.save();
      const bidAction = loadOrCreateBidAction(bid.id, event.transaction, event.block);
      bidAction.action = 'BID_CLOSE';
      bidAction.save();
    }
    updatePositionPrice(position);
  }
}

export function handleBidExecuted(event: BidExecuted): void {
  const pawnShop = loadOrCreatePawnshop(event.address, event.block);
  const position = loadOrCreatePosition(event.params.posId, event.block);
  if (position) {
    loadOrCreatePositionAction(position, 'BID_EXECUTE', event.block, event.transaction);
    position.open = false;
    position.save();
    const bid = loadOrCreateBid(event.params.bidId, event.block);
    if (bid) {
      const bidAction = loadOrCreateBidAction(bid.id, event.transaction, event.block);
      bidAction.action = 'BID_EXECUTE';
      bidAction.save();

      // FEE AMOUNT
      const feeAmount = event.params.amount.times(pawnShop.platformFee).div(DENOMINATOR);
      addFeeAmount(position.id, feeAmount, event.block);
    }
    const info = PositionInfoEntity.load(position.id)
    if (info && info.posDurationBlocks.isZero()) {
      position.open = false;
      position.save();
      const execution = PositionExecutionEntity.load(position.id);
      if (execution) {
        execution.posEndTs = event.block.timestamp;
        execution.save();
      }
    }
    updatePositionPrice(position);
  }
}

export function handlePositionClaimed(event: PositionClaimed): void {
  loadOrCreatePawnshop(event.address, event.block);
  const position = loadOrCreatePosition(event.params.posId, event.block);
  if (position) {
    loadOrCreatePositionAction(position, 'CLAIM_POSITION', event.block, event.transaction);
    position.open = false;
    position.save();
    const execution = PositionExecutionEntity.load(position.id);
    if (execution) {
      execution.posEndTs = event.block.timestamp;
      execution.save();
    }
    updatePositionPrice(position);
  }
}

export function handlePositionRedeemed(event: PositionRedeemed): void {
  loadOrCreatePawnshop(event.address, event.block);
  const position = loadOrCreatePosition(event.params.posId, event.block);
  if (position) {
    loadOrCreatePositionAction(position, 'REDEEM_POSITION', event.block, event.transaction);
    position.open = false;
    position.save();
    const execution = PositionExecutionEntity.load(position.id);
    if (execution) {
      execution.posEndTs = event.block.timestamp;
      execution.save();
    }
    updatePositionPrice(position);
  }
}

export function handlePlatformFeeChanged(event: PlatformFeeChanged): void {
  const pawnshop =loadOrCreatePawnshop(event.address, event.block);
  if (pawnshop) {
    pawnshop.platformFee = event.params.newFee;
    pawnshop.save();

    const id = event.transaction.hash.toHexString();
    let history = PlaftformFeeHistoryEntity.load(id)
    if (!history) {
      history = new PlaftformFeeHistoryEntity(id);
      history.newFee = event.params.newFee;
      history.oldFee = event.params.oldFee;
      history.timestamp = event.block.timestamp
      history.createAtBlock = event.block.number
      history.save();
    }
  }
}
