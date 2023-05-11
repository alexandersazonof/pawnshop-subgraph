import { TokenEntity } from '../../generated/schema';
import { fetchDecimals, fetchName, fetchSymbol, fetchTotalSupply } from '../utils/erc20';
import { Address, BigInt } from '@graphprotocol/graph-ts';
import { DEFAULT_DECIMALS_NUM } from '../utils/constant';
import { fetchTokenUri } from '../utils/erc721';

export function loadOrCreateErc20Token(address: Address): TokenEntity {
  let token = TokenEntity.load(address.toHex());
  if (!token) {
    token = new TokenEntity(address.toHex());
    token.decimals = fetchDecimals(address).toI32();
    token.name = fetchName(address);
    token.symbol = fetchSymbol(address);
    token.totalSupply = fetchTotalSupply(address);
    token.isErc721 = false;
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
    token.save()
  }
  return token;
}