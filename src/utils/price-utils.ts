import { Address, BigInt } from '@graphprotocol/graph-ts';
import { PriceCalculator } from '../../generated/PawnShopContract/PriceCalculator';
import { PRICE_CALCULATOR } from './constant';

export function getPrice(address: Address): BigInt {
  const tryVal = PriceCalculator.bind(PRICE_CALCULATOR).try_getPriceWithDefaultOutput(address);
  return tryVal.reverted ? BigInt.zero() : tryVal.value;
}