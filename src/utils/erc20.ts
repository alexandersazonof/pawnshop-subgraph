import { Address, BigInt } from '@graphprotocol/graph-ts';
import { ERC20 } from '../../generated/PawnShopContract/ERC20';
import { DEFAULT_DECIMALS, DEFAULT_VALUE } from './constant';

export function fetchDecimals(address: Address): BigInt {
  const erc20 = ERC20.bind(address);
  const tryDecimals = erc20.try_decimals();
  return tryDecimals.reverted ? DEFAULT_DECIMALS : BigInt.fromI32(tryDecimals.value)
}

export function fetchName(address: Address): string {
  const erc20 = ERC20.bind(address);
  const tryName = erc20.try_name();
  return tryName.reverted ? DEFAULT_VALUE : tryName.value
}