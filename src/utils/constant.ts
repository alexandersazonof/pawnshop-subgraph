import { Address, BigInt } from '@graphprotocol/graph-ts';

export const PAWN_SHOP_CONTRACT = Address.fromString('0xde9aeb389a74b32a66d960b38c1b453a4ff4bdc0');

export const DEFAULT_DECIMALS = BigInt.fromI32(18);
export const DEFAULT_DECIMALS_NUM = 18;
export const DEFAULT_VALUE = 'undefined';

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