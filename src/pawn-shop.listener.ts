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
import {
  loadOrCreatePosition,
  toPositionExecutionEntity,
  updatePositionInfo,
  updatePositionPrice,
} from './types/position';
import { loadOrCreatePositionAction } from './types/position-action';
import { loadOrCreateBid } from './types/bid';
import { loadOrCreateBidAction } from './types/bid-action';
import { loadOrCreatePawnshop } from './types/pawnshop';
import { DENOMINATOR } from './utils/constant';
import {
  PlaftformFeeHistoryEntity,
  PositionAcquiredEntity,
  PositionExecutionEntity,
  PositionInfoEntity,
} from '../generated/schema';
import { addFeeAmount } from './types/fee-amount';
import { BigInt } from '@graphprotocol/graph-ts';

export function handlePositionOpened(event: PositionOpened): void {
  loadOrCreatePawnshop(event.address, event.block);
  const position = loadOrCreatePosition(event.params.posId, event.block);
  if (position) {
    let price: BigInt | null = null;
    if (position.type === 'LoanAuction' || position.type === 'Auction') {
      price = position.minAuctionAmount;
    } else {
      const acquired = PositionAcquiredEntity.load(position.id);
      if (acquired) {
        price = acquired.acquiredAmount;
      }
    }

    loadOrCreatePositionAction(position, 'OPEN_POSITION', event.block, event.transaction, price, position.borrower, null);
  }
}

export function handlePositionClosed(event: PositionClosed): void {
  loadOrCreatePawnshop(event.address, event.block);
  const position = loadOrCreatePosition(event.params.posId, event.block);
  if (position) {
    loadOrCreatePositionAction(position, 'CLOSE_POSITION', event.block, event.transaction, null, position.borrower, null);
    position.open = false;
    position.save();
    updatePositionPrice(position);
  }
}

export function handleAuctionBidOpened(event: AuctionBidOpened): void {
  loadOrCreatePawnshop(event.address, event.block);
  const position = loadOrCreatePosition(event.params.posId, event.block);
  if (position) {
    let from: string | null = null;
    let price: BigInt | null = null;
    const bid = loadOrCreateBid(event.params.bidId, event.block);
    if (bid) {
      const bidAction = loadOrCreateBidAction(bid.id, event.transaction, event.block);
      from = bid.lender;
      price = bid.amount;
    }
    loadOrCreatePositionAction(position, 'BID_OPEN', event.block, event.transaction, price, from, position.borrower);
    updatePositionPrice(position);
  }
}

export function handleAuctionBidAccepted(event: AuctionBidAccepted): void {
  loadOrCreatePawnshop(event.address, event.block);
  const position = loadOrCreatePosition(event.params.posId, event.block);
  if (position) {
    const bid = loadOrCreateBid(event.params.bidId, event.block);
    let to: string | null = null;
    let price: BigInt | null = null;
    if (bid) {
      bid.open = false;
      bid.save();
      const bidAction = loadOrCreateBidAction(bid.id, event.transaction, event.block);
      bidAction.action = 'BID_ACCEPT';
      bidAction.save();
      to = bid.lender;
      price = bid.amount;
    }
    loadOrCreatePositionAction(position, 'BID_ACCEPT', event.block, event.transaction, price, position.borrower, to);
    updatePositionPrice(position);
  }
}

export function handleAuctionBidClosed(event: AuctionBidClosed): void {
  loadOrCreatePawnshop(event.address, event.block);
  const position = loadOrCreatePosition(event.params.posId, event.block);
  if (position) {
    const bid = loadOrCreateBid(event.params.bidId, event.block);
    let from: string | null = null;
    let price: BigInt | null = null;
    if (bid) {
      bid.open = false;
      bid.save();
      const bidAction = loadOrCreateBidAction(bid.id, event.transaction, event.block);
      bidAction.action = 'BID_CLOSE';
      bidAction.save();
      from = bid.lender;
      price = bid.amount;
    }
    loadOrCreatePositionAction(position, 'BID_CLOSE', event.block, event.transaction, price, from, position.borrower);
    updatePositionPrice(position);
  }
}

export function handleBidExecuted(event: BidExecuted): void {
  const pawnShop = loadOrCreatePawnshop(event.address, event.block);
  const position = loadOrCreatePosition(event.params.posId, event.block);
  if (position) {
    const bid = loadOrCreateBid(event.params.bidId, event.block);
    let price: BigInt | null = null;
    let to: string | null = null;
    if (bid) {
      const bidAction = loadOrCreateBidAction(bid.id, event.transaction, event.block);
      bidAction.action = 'BID_EXECUTE';
      bidAction.save();

      to = bid.lender;
      price = bid.amount;

      // FEE AMOUNT
      const feeAmount = event.params.amount.times(pawnShop.platformFee).div(DENOMINATOR);
      addFeeAmount(position.id, feeAmount, event.block);
    }
    loadOrCreatePositionAction(position, 'BID_EXECUTE', event.block, event.transaction, price, position.borrower, to);
    updatePositionInfo(event.params.posId, event.block);
    updatePositionPrice(position);
  }
}

export function handlePositionClaimed(event: PositionClaimed): void {
  loadOrCreatePawnshop(event.address, event.block);
  const position = loadOrCreatePosition(event.params.posId, event.block);
  if (position) {
    loadOrCreatePositionAction(position, 'CLAIM_POSITION', event.block, event.transaction, null, event.params.sender.toHex(), position.borrower);
    updatePositionInfo(event.params.posId, event.block);
    updatePositionPrice(position);
  }
}

export function handlePositionRedeemed(event: PositionRedeemed): void {
  loadOrCreatePawnshop(event.address, event.block);
  const position = loadOrCreatePosition(event.params.posId, event.block);
  if (position) {
    loadOrCreatePositionAction(position, 'REDEEM_POSITION', event.block, event.transaction, null, event.params.sender.toHex(), null);
    updatePositionInfo(event.params.posId, event.block);
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
