import { BigInt } from "@graphprotocol/graph-ts"
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
import { ExampleEntity } from "../generated/schema"

export function handleAuctionBidAccepted(event: AuctionBidAccepted): void {
  // Entities can be loaded from the store using a string ID; this ID
  // needs to be unique across all entities of the same type
  let entity = ExampleEntity.load(event.transaction.from.toHex())

  // Entities only exist after they have been saved to the store;
  // `null` checks allow to create entities on demand
  if (!entity) {
    entity = new ExampleEntity(event.transaction.from.toHex())

    // Entity fields can be set using simple assignments
    entity.count = BigInt.fromI32(0)
  }

  // BigInt and BigDecimal math are supported
  entity.count = entity.count + BigInt.fromI32(1)

  // Entity fields can be set based on event parameters
  entity.posId = event.params.posId
  entity.bidId = event.params.bidId

  // Entities can be written to the store with `.save()`
  entity.save()

  // Note: If a handler doesn't require existing field values, it is faster
  // _not_ to load the entity from the store. Instead, create it fresh with
  // `new Entity(...)`, set the fields that should be updated and save the
  // entity back to the store. Fields that were not set or unset remain
  // unchanged, allowing for partial updates to be applied.

  // It is also possible to access smart contracts from mappings. For
  // example, the contract that has emitted the event can be connected to
  // with:
  //
  // let contract = Contract.bind(event.address)
  //
  // The following functions can then be called on this contract to access
  // state variables and other data:
  //
  // - contract.AUCTION_DURATION(...)
  // - contract.DENOMINATOR(...)
  // - contract.PLATFORM_FEE_MAX(...)
  // - contract.VERSION(...)
  // - contract.auctionBidCounter(...)
  // - contract.auctionBidSize(...)
  // - contract.auctionBids(...)
  // - contract.borrowerPositions(...)
  // - contract.borrowerPositionsSize(...)
  // - contract.controller(...)
  // - contract.created(...)
  // - contract.getAssetType(...)
  // - contract.getAuctionBid(...)
  // - contract.getPosition(...)
  // - contract.isController(...)
  // - contract.isERC20(...)
  // - contract.isERC721(...)
  // - contract.isGovernance(...)
  // - contract.lastAuctionBidTs(...)
  // - contract.lenderOpenBids(...)
  // - contract.lenderPositions(...)
  // - contract.lenderPositionsSize(...)
  // - contract.onERC721Received(...)
  // - contract.openPosition(...)
  // - contract.openPositions(...)
  // - contract.openPositionsSize(...)
  // - contract.platformFee(...)
  // - contract.posIndexes(...)
  // - contract.positionCounter(...)
  // - contract.positionDepositAmount(...)
  // - contract.positionDepositToken(...)
  // - contract.positionToBidIds(...)
  // - contract.positions(...)
  // - contract.positionsByAcquired(...)
  // - contract.positionsByAcquiredSize(...)
  // - contract.positionsByCollateral(...)
  // - contract.positionsByCollateralSize(...)
  // - contract.toRedeem(...)
}

export function handleAuctionBidClosed(event: AuctionBidClosed): void {}

export function handleAuctionBidOpened(event: AuctionBidOpened): void {}

export function handleBidExecuted(event: BidExecuted): void {}

export function handlePositionClaimed(event: PositionClaimed): void {}

export function handlePositionClosed(event: PositionClosed): void {}

export function handlePositionOpened(event: PositionOpened): void {}

export function handlePositionRedeemed(event: PositionRedeemed): void {}

export function handleUpdateController(event: UpdateController): void {}
