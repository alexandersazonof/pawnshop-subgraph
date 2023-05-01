import {
  PawnShopContract,
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

export function handlePositionOpened(event: PositionOpened): void {
  event.params.posId
}

export function handleAuctionBidAccepted(event: AuctionBidAccepted): void {}

export function handleAuctionBidClosed(event: AuctionBidClosed): void {}

export function handleAuctionBidOpened(event: AuctionBidOpened): void {}

export function handleBidExecuted(event: BidExecuted): void {}

export function handlePositionClaimed(event: PositionClaimed): void {}

export function handlePositionClosed(event: PositionClosed): void {}


export function handlePositionRedeemed(event: PositionRedeemed): void {}

export function handleUpdateController(event: UpdateController): void {}
