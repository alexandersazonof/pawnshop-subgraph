import {
  PositionAcquiredEntity,
  PositionCollateralEntity,
  PositionEntity, PositionExecutionEntity,
  PositionInfoEntity,
} from '../../generated/schema';
import { BigInt, ethereum, log } from '@graphprotocol/graph-ts';
import { getPosition } from '../utils/pawn-shop.contract';
import { loadOrCreateErc721Token, loadOrCreateErc20Token } from './token';
import { PawnShopContract__getPositionResultValue0Struct } from '../../generated/PawnShopContract/PawnShopContract';

export function loadOrCreatePosition(posId: BigInt, block: ethereum.Block): PositionEntity | null {
  const id = `${posId.toString()}`;
  let position = PositionEntity.load(id)
  if (!position) {
    const positionResult = getPosition(BigInt.fromString(id));

    if (positionResult) {
      position = new PositionEntity(id);

      position.borrower = positionResult.borrower.toHex()
      position.depositToken = loadOrCreateErc20Token(positionResult.depositToken).id

      position.open = positionResult.open

      position.info = toPositionInfo(id, positionResult).id;
      position.collateral = toPositionCollateral(id, positionResult).id;
      position.acquired = toPositionAcquiredEntity(id, positionResult).id;
      position.execution = toPositionExecutionEntity(id, positionResult).id;

      position.type = toPositionType(positionResult);

      position.createAtBlock = block.number;
      position.timestamp = block.timestamp;
      position.save();
    } else {
      log.warning("CAN NOT GET POSITION BY ID: {}", [posId.toString()]);
      return null;
    }
  }
  return position;
}

export function toPositionInfo(posId: string, position: PawnShopContract__getPositionResultValue0Struct): PositionInfoEntity {
  let positionInfo = PositionInfoEntity.load(posId);
  if (!positionInfo) {
    positionInfo = new PositionInfoEntity(posId);
    positionInfo.posDurationBlocks = position.info.posDurationBlocks;
    positionInfo.posFee = position.info.posFee;
    positionInfo.createdBlock = position.info.createdBlock;
    positionInfo.createdTs = position.info.createdTs;

    positionInfo.save();
  }
  return positionInfo;
}

export function toPositionCollateral(posId: string, position: PawnShopContract__getPositionResultValue0Struct): PositionCollateralEntity {
  let collateral = PositionCollateralEntity.load(posId);
  if (!collateral) {
    const token = position.collateral.collateralType == 1
      ? loadOrCreateErc721Token(position.collateral.collateralToken, position.collateral.collateralTokenId).id
      : loadOrCreateErc20Token(position.collateral.collateralToken).id;

    collateral = new PositionCollateralEntity(posId);
    collateral.collateralToken = token
    collateral.collateralType = position.collateral.collateralType;
    collateral.collateralAmount = position.collateral.collateralAmount;
    collateral.tokenId = position.collateral.collateralTokenId;

    collateral.save();
  }
  return collateral;
}

export function toPositionAcquiredEntity(posId: string, position: PawnShopContract__getPositionResultValue0Struct): PositionAcquiredEntity {
  let acquired = PositionAcquiredEntity.load(posId);
  if (!acquired) {
    acquired = new PositionAcquiredEntity(posId);
    acquired.acquiredToken = loadOrCreateErc20Token(position.acquired.acquiredToken).id;
    acquired.acquiredAmount = position.acquired.acquiredAmount;

    acquired.save();
  }
  return acquired;
}

export function toPositionExecutionEntity(posId: string, position: PawnShopContract__getPositionResultValue0Struct): PositionExecutionEntity {
  let execution = PositionExecutionEntity.load(posId);
  if (!execution) {
    execution = new PositionExecutionEntity(posId);
    execution.lender = position.execution.lender.toHex();
    execution.posStartBlock = position.execution.posStartBlock;
    execution.posStartTs = position.execution.posStartTs;
    execution.posEndTs = position.execution.posEndTs;

    execution.save();
  }
  return execution;
}

export function toPositionType(position: PawnShopContract__getPositionResultValue0Struct): string {
  if (!position.info.posDurationBlocks.isZero() && position.acquired.acquiredAmount.isZero()) {
    return 'Auction';
  }

  return 'Sale';
}