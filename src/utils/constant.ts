import { Address, BigDecimal, BigInt } from '@graphprotocol/graph-ts';

export const PAWN_SHOP_CONTRACT = Address.fromString('0xdeabad6cf2ffc7357651d0c52739536e89870532');
export const PRICE_CALCULATOR = Address.fromString('0x0B62ad43837A69Ad60289EEea7C6e907e759F6E8');

export const DEFAULT_DECIMALS = BigInt.fromI32(18);
export const DEFAULT_DECIMALS_NUM = 18;
export const DEFAULT_VALUE = 'undefined';
export const DENOMINATOR = BigInt.fromString('10000');

export const BD_18 = BigDecimal.fromString('1000000000000000000');

export const BD_TEN = BigDecimal.fromString('10');

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