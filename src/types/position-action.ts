import { BigInt, ethereum } from '@graphprotocol/graph-ts';
import { PositionActionEntity, PositionCollateralEntity, PositionEntity } from '../../generated/schema';
import { toPositionCollateral } from './position';

export function loadOrCreatePositionAction(
  position: PositionEntity,
  action: string,
  block: ethereum.Block,
  tx: ethereum.Transaction,
  price: BigInt | null,
  from: string | null,
  to: string | null
): PositionActionEntity {
  const id = `${position.id}-${tx.hash.toHex()}`
  let positionAction = PositionActionEntity.load(id)
  if (!positionAction) {
    positionAction = new PositionActionEntity(id);

    let collateral = PositionCollateralEntity.load(position.collateral)

    positionAction.tx = tx.hash.toHex();
    positionAction.action = action;
    positionAction.position = position.id;
    positionAction.price = price;
    positionAction.from = from;
    positionAction.to = to;
    positionAction.createAtBlock = block.number
    positionAction.timestamp = block.timestamp

    if (collateral) {
      positionAction.collateralToken = collateral.collateralToken;
    }

    positionAction.save();
  }

  return positionAction;
}