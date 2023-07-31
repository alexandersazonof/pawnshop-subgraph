import { Address, BigInt, ethereum } from '@graphprotocol/graph-ts';
import { PawnshopEntity } from '../../generated/schema';
import { PawnShopContract } from '../../generated/PawnShopContract/PawnShopContract';

export function loadOrCreatePawnshop(address: Address, block: ethereum.Block): PawnshopEntity {
  const id = `${address.toHex()}`
  let pawnshop = PawnshopEntity.load(id)
  if (!pawnshop) {
    pawnshop = new PawnshopEntity(id);

    pawnshop.feeRecipient = feeRecipient(address).toHex();
    pawnshop.platformFee = platformFee(address);
    pawnshop.positionDepositAmount = positionDepositAmount(address);

    pawnshop.createAtBlock = block.number
    pawnshop.timestamp = block.timestamp
    pawnshop.save();
  }

  return pawnshop;
}

export function platformFee(address: Address): BigInt {
  return PawnShopContract.bind(address).platformFee()
}

export function feeRecipient(address: Address): Address {
  const contract = PawnShopContract.bind(address);
  const tryFeeRecipient = contract.try_feeRecipient();
  return tryFeeRecipient.reverted ? Address.zero() : tryFeeRecipient.value;
}

export function positionDepositAmount(address: Address): BigInt {
  const contract = PawnShopContract.bind(address);
  const tryPositionDepositAmount = contract.try_positionDepositAmount();
  return tryPositionDepositAmount.reverted ? BigInt.zero() : tryPositionDepositAmount.value;
}