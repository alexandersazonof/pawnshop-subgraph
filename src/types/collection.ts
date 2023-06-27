import { CollectionEntity } from '../../generated/schema';
import { fetchName, fetchSymbol, fetchTotalSupply } from '../utils/erc721';
import { Address } from '@graphprotocol/graph-ts';

export function loadOrCreateCollection(address: Address): CollectionEntity {
  let collection = CollectionEntity.load(address.toHex());
  if (!collection) {
    collection = new CollectionEntity(address.toHex());
  }
  collection.name = fetchName(address)
  collection.symbol = fetchSymbol(address)
  collection.totalSupply = fetchTotalSupply(address)
  collection.save();
  return collection;
}