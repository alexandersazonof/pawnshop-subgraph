import { TokenEntity } from '../../generated/schema';
import { fetchDecimals, fetchName, fetchSymbol, fetchTotalSupply } from '../utils/erc20';
import { Address, BigDecimal, BigInt } from '@graphprotocol/graph-ts';
import { BD_18, DEFAULT_DECIMALS_NUM } from '../utils/constant';
import { fetchTokenUri } from '../utils/erc721';
import { getPrice } from '../utils/price-utils';
import { loadOrCreateCollection } from './collection';

export function loadOrCreateErc20Token(address: Address): TokenEntity {
  let token = TokenEntity.load(address.toHex());
  if (!token) {
    token = new TokenEntity(address.toHex());
    token.decimals = fetchDecimals(address).toI32();
    token.name = fetchName(address);
    token.symbol = fetchSymbol(address);
    token.totalSupply = fetchTotalSupply(address);
    token.isErc721 = false;
    token.price = BigDecimal.zero();
    token.save()
  }
  return token;
}

export function loadOrCreateErc721Token(address: Address, tokenId: BigInt): TokenEntity {
  const id = `${address.toHex()}-${tokenId}`;
  let token = TokenEntity.load(id);
  if (!token) {
    token = new TokenEntity(id);
    token.decimals = DEFAULT_DECIMALS_NUM;
    token.name = fetchName(address);
    token.symbol = fetchSymbol(address);
    token.tokenUri = fetchTokenUri(address, tokenId)
    token.isErc721 = true;
    token.tokenId = tokenId;
    token.contractAddress = address.toHex()
    token.price = BigDecimal.zero();
    token.collection = loadOrCreateCollection(address).id
    token.save()
  }
  return token;
}

export function updateTokenPrice(address: Address): void {
  const token = loadOrCreateErc20Token(address);
  const price = getPrice(address);
  if (!price.isZero()) {
    token.price = price.divDecimal(BD_18);
    token.save();
  }
}