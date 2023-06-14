import { ethereum } from '@graphprotocol/graph-ts';
import { PositionActionEntity, PositionCollateralEntity, PositionEntity } from '../../generated/schema';
import { toPositionCollateral } from './position';

export function loadOrCreatePositionAction(position: PositionEntity, action: string, block: ethereum.Block, tx: ethereum.Transaction): PositionActionEntity {
  const id = `${position.id}-${tx.hash.toHex()}`
  let positionAction = PositionActionEntity.load(id)
  if (!positionAction) {
    positionAction = new PositionActionEntity(id);

    let collateral = PositionCollateralEntity.load(position.collateral)


    positionAction.action = action;
    positionAction.position = position.id;
    positionAction.createAtBlock = block.number
    positionAction.timestamp = block.timestamp

    if (collateral) {
      positionAction.collateralToken = collateral.collateralToken;
    }

    positionAction.save();
  }

  return positionAction;
}