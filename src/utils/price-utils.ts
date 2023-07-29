import { Address, BigInt } from '@graphprotocol/graph-ts';
import { PriceCalculator } from '../../generated/PawnShopContract/PriceCalculator';
import { getPriceAddress } from './constant';

export function getPrice(address: Address): BigInt {
  const tryVal = PriceCalculator.bind(getPriceAddress()).try_getPriceWithDefaultOutput(address);
  return tryVal.reverted ? BigInt.zero() : tryVal.value;
}