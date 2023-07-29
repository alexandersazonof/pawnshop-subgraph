import {
  PawnShopContract, PawnShopContract__getAuctionBidResultValue0Struct,
  PawnShopContract__getPositionResultValue0Struct,
} from '../../generated/PawnShopContract/PawnShopContract';
import { getPawnshopContractAddress } from './constant';
import { BigInt } from '@graphprotocol/graph-ts';

export function getPosition(posId: BigInt): PawnShopContract__getPositionResultValue0Struct | null {
  const contract = PawnShopContract.bind(getPawnshopContractAddress())
  let tryPosition = contract.try_getPosition(posId)
  return tryPosition.reverted ? null : tryPosition.value
}

export function getBid(bidId: BigInt): PawnShopContract__getAuctionBidResultValue0Struct | null {
  const contract = PawnShopContract.bind(getPawnshopContractAddress())
  let tryBid = contract.try_getAuctionBid(bidId)
  return tryBid.reverted ? null : tryBid.value;
}