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

export function handlePositionOpened(event: PositionOpened): void {
  const position = loadOrCreatePosition(event.params.posId.toI32(), event.block);
  if (position) {
    loadOrCreatePositionAction(position.id, ActionType.OPEN_POSITION.toString(), event.block, event.transaction);
  }
}

export function handleAuctionBidAccepted(event: AuctionBidAccepted): void {
  const position = loadOrCreatePosition(event.params.posId.toI32(), event.block);
  if (position) {
    loadOrCreatePositionAction(position.id, ActionType.BID_ACCEPT.toString(), event.block, event.transaction);
  }
}

export function handleAuctionBidClosed(event: AuctionBidClosed): void {
  const position = loadOrCreatePosition(event.params.posId.toI32(), event.block);
  if (position) {
    loadOrCreatePositionAction(position.id, ActionType.BID_CLOSE.toString(), event.block, event.transaction);
  }
}

export function handleAuctionBidOpened(event: AuctionBidOpened): void {
  const position = loadOrCreatePosition(event.params.posId.toI32(), event.block);
  if (position) {
    loadOrCreatePositionAction(position.id, ActionType.BID_OPEN.toString(), event.block, event.transaction);
  }
}

export function handleBidExecuted(event: BidExecuted): void {
  const position = loadOrCreatePosition(event.params.posId.toI32(), event.block);
  if (position) {
    loadOrCreatePositionAction(position.id, ActionType.BID_EXECUTE.toString(), event.block, event.transaction);
  }
}

export function handlePositionClaimed(event: PositionClaimed): void {
  const position = loadOrCreatePosition(event.params.posId.toI32(), event.block);
  if (position) {
    loadOrCreatePositionAction(position.id, ActionType.CLAIM_POSITION.toString(), event.block, event.transaction);
  }
}

export function handlePositionClosed(event: PositionClosed): void {
  const position = loadOrCreatePosition(event.params.posId.toI32(), event.block);
  if (position) {
    loadOrCreatePositionAction(position.id, ActionType.CLOSE_POSITION.toString(), event.block, event.transaction);
  }
}

export function handlePositionRedeemed(event: PositionRedeemed): void {
  const position = loadOrCreatePosition(event.params.posId.toI32(), event.block);
  if (position) {
    loadOrCreatePositionAction(position.id, ActionType.REDEEM_POSITION.toString(), event.block, event.transaction);
  }
}

export function handleUpdateController(event: UpdateController): void {}
