import { Address, BigInt } from '@graphprotocol/graph-ts';
import { ERC721 } from '../../generated/PawnShopContract/ERC721';

export function fetchTokenUri(address: Address, tokenId: BigInt): string | null {
  const contract = ERC721.bind(address);
  const tryTokenUri = contract.try_tokenURI(tokenId);
  return tryTokenUri.reverted ? null : tryTokenUri.value;
}

export function fetchName(address: Address): string | null {
  const contract = ERC721.bind(address);
  const tryVal = contract.try_name();
  return tryVal.reverted ? null : tryVal.value
}

export function fetchSymbol(address: Address): string | null {
  const contract = ERC721.bind(address);
  const tryVal = contract.try_symbol();
  return tryVal.reverted ? null : tryVal.value
}

export function fetchTotalSupply(address: Address): BigInt {
  const contract = ERC721.bind(address);
  const tryVal = contract.try_totalSupply();
  return tryVal.reverted ? BigInt.zero() : tryVal.value
}