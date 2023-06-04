import { Address, BigInt } from '@graphprotocol/graph-ts';

export const PAWN_SHOP_CONTRACT = Address.fromString('0xdeabad6cf2ffc7357651d0c52739536e89870532');

export const DEFAULT_DECIMALS = BigInt.fromI32(18);
export const DEFAULT_DECIMALS_NUM = 18;
export const DEFAULT_VALUE = 'undefined';
export const DENOMINATOR = BigInt.fromString('10000');

export enum ActionType {
  OPEN_POSITION,
  CLAIM_POSITION,
  CLOSE_POSITION,
  REDEEM_POSITION,
  BID_ACCEPT,
  BID_CLOSE,
  BID_OPEN,
  BID_EXECUTE,
}