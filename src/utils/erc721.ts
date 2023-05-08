import { Address, BigInt } from '@graphprotocol/graph-ts';
import { ERC721 } from '../../generated/PawnShopContract/ERC721';

export function fetchTokenUri(address: Address, tokenId: BigInt): string | null {
  const contract = ERC721.bind(address);
  const tryTokenUri = contract.try_tokenURI(tokenId);
  return tryTokenUri.reverted ? null : tryTokenUri.value;
}