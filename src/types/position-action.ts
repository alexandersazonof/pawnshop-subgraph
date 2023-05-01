import { ethereum } from '@graphprotocol/graph-ts';
import { PositionActionEntity } from '../../generated/schema';

export function loadOrCreatePositionAction(posId: string, action: string, block: ethereum.Block, tx: ethereum.Transaction): PositionActionEntity {
  const id = `${posId}-${tx.hash.toHex()}`
  let positionAction = PositionActionEntity.load(id)
  if (!positionAction) {
    positionAction = new PositionActionEntity(id);

    positionAction.action = action;
    positionAction.position = posId;
    positionAction.createAtBlock = block.number
    positionAction.timestamp = block.timestamp

    positionAction.save();
  }

  return positionAction;
}