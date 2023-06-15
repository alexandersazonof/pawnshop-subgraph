import {
  PositionAcquiredEntity,
  PositionCollateralEntity,
  PositionEntity, PositionExecutionEntity,
  PositionInfoEntity, TokenEntity,
} from '../../generated/schema';
import { Address, BigDecimal, BigInt, ethereum, log } from '@graphprotocol/graph-ts';
import { getPosition } from '../utils/pawn-shop.contract';
import { loadOrCreateErc721Token, loadOrCreateErc20Token, updateTokenPrice } from './token';
import { PawnShopContract__getPositionResultValue0Struct } from '../../generated/PawnShopContract/PawnShopContract';
import { pow } from '../utils/math';
import { BD_TEN } from '../utils/constant';

export function loadOrCreatePosition(posId: BigInt, block: ethereum.Block): PositionEntity | null {
  const id = `${posId.toString()}`;
  let position = PositionEntity.load(id)
  if (!position) {
    const positionResult = getPosition(posId);
    if (positionResult != null) {
      position = new PositionEntity(id);

      position.borrower = positionResult.borrower.toHex()
      position.minAuctionAmount = positionResult.minAuctionAmount
      position.depositToken = loadOrCreateErc20Token(positionResult.depositToken).id

      position.open = positionResult.open

      position.info = toPositionInfo(id, positionResult).id;
      position.collateral = toPositionCollateral(id, positionResult).id;
      position.acquired = toPositionAcquiredEntity(id, positionResult).id;
      position.execution = toPositionExecutionEntity(id, positionResult).id;

      position.type = toPositionType(positionResult);

      position.createAtBlock = block.number;
      position.timestamp = block.timestamp;
      position.startPrice = BigDecimal.zero();

      let acquired = PositionAcquiredEntity.load(position.acquired)
      if (acquired) {
        let acquiredToken = TokenEntity.load(acquired.acquiredToken)
        if (acquiredToken && acquiredToken.price) {
          if (position.minAuctionAmount.gt(BigInt.zero())) {
            position.startPrice = position.minAuctionAmount.divDecimal(pow(BD_TEN, acquiredToken.decimals))
              .times(acquiredToken.price!)
          } else {
            position.startPrice = acquired.acquiredAmount.divDecimal(pow(BD_TEN, acquiredToken.decimals))
              .times(acquiredToken.price!)
          }
        }
      }

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
  } else {
    execution.lender = position.execution.lender.toHex();
    execution.posStartBlock = position.execution.posStartBlock;
    execution.posStartTs = position.execution.posStartTs;
    execution.posEndTs = position.execution.posEndTs;
  }
  execution.save();

  return execution;
}

export function toPositionType(position: PawnShopContract__getPositionResultValue0Struct): string {
  if (
    position.info.posDurationBlocks.isZero()
    && position.minAuctionAmount.isZero()
    && position.acquired.acquiredAmount.isZero()
  ) {
    return 'Auction';
  } else if (
    position.info.posDurationBlocks.isZero()
    && position.minAuctionAmount.isZero()
    && position.acquired.acquiredAmount.gt(BigInt.zero())
  ) {
    return 'Sale';
  } else if (position.info.posDurationBlocks.gt(BigInt.zero()) && position.acquired.acquiredAmount.isZero()) {
    return 'LoanAuction';
  }

  return 'Loan';
}

export function updatePositionPrice(position: PositionEntity): void {
  if (position.collateral != null) {
    const collateral = PositionCollateralEntity.load(position.collateral);
    if (collateral && collateral.collateralToken && collateral.collateralType != 1) {
      updateTokenPrice(Address.fromString(collateral.collateralToken))
    }
  }
  if (position.acquired != null) {
    const acquired = PositionAcquiredEntity.load(position.acquired);
    if (acquired && acquired.acquiredToken) {
      updateTokenPrice(Address.fromString(acquired.acquiredToken))
    }
  }
}

export function updatePositionInfo(id: BigInt, block: ethereum.Block): PositionEntity | null {
  const position = loadOrCreatePosition(id, block);
  const positionResult = getPosition(id);
  if (position && positionResult) {
    position.execution = toPositionExecutionEntity(position.id, positionResult).id;
    position.open = positionResult.open;
    position.save()
  }
  return position;
}