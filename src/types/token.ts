import { TokenEntity } from '../../generated/schema';
import { fetchDecimals, fetchName } from '../utils/erc20';
import { Address } from '@graphprotocol/graph-ts';

export function loadOrCreateToken(address: Address): TokenEntity {
  let token = TokenEntity.load(address.toHex());
  if (!token) {
    token = new TokenEntity(address.toHex());
    token.decimals = fetchDecimals(address).toI32();
    token.name = fetchName(address);
    token.save()
  }
  return token;
}