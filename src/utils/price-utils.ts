import { Address, BigInt } from '@graphprotocol/graph-ts';
import { PriceCalculator } from '../../generated/PawnShopContract/PriceCalculator';
import { PRICE_CALCULATOR } from './constant';

export function getPrice(address: Address): BigInt {
  return PriceCalculator.bind(PRICE_CALCULATOR).getPriceWithDefaultOutput(address);
}