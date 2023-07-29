import {
  PawnShopContract,
  PawnShopContract__getAuctionBidResultValue0Struct,
  PawnShopContract__getPositionResultValue0Struct,
} from '../../generated/PawnShopContract/PawnShopContract';
import { Address, BigInt } from '@graphprotocol/graph-ts';

export function getPosition(
  posId: BigInt,
  pawnshopAdr: Address,
): PawnShopContract__getPositionResultValue0Struct | null {
  const contract = PawnShopContract.bind(pawnshopAdr);
  let tryPosition = contract.try_getPosition(posId);
  return tryPosition.reverted ? null : tryPosition.value;
}

export function getBid(bidId: BigInt, pawnshopAdr: Address): PawnShopContract__getAuctionBidResultValue0Struct | null {
  const contract = PawnShopContract.bind(pawnshopAdr);
  let tryBid = contract.try_getAuctionBid(bidId);
  return tryBid.reverted ? null : tryBid.value;
}
