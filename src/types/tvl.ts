import {
  BidEntity,
  PawnshopEntity, PositionAcquiredEntity,
  PositionCollateralEntity,
  PositionEntity,
  TokenEntity,
  TvlEntity, TvlHistoryEntity,
} from '../../generated/schema';
import { CONST_ID } from '../utils/constant';
import { BigDecimal, ethereum, log } from '@graphprotocol/graph-ts';
import { formatUnits } from '../utils/number';

export function updateTvl(position: PositionEntity, block: ethereum.Block): void {
  const tvl = getTvl();
  const pawnshop = PawnshopEntity.load(position.pawnshop)
  let array: string[] = [];
  if (position.open) {
    array = tvl.activePositions! || [];
    array.push(position.id);
  } else {
    const tempArray = tvl.activePositions || [];
    if (tempArray) {
      for (let i = 0; i < tempArray.length; i++) {
        if (tempArray[i] !== position.id) {
          array.push(tempArray[i])
        }
      }
    }
  }
  tvl.activePositions = array;

  if (array) {
    let collateralValue = BigDecimal.zero();
    let depositTokenValue = BigDecimal.zero();
    let bidsValue = BigDecimal.zero();

    for (let i = 0; i < array.length; i++) {
      const pos = PositionEntity.load(array[i])
      if (pos) {
        // collateral logic
        const collateral = PositionCollateralEntity.load(array[i])
        const acquired = PositionAcquiredEntity.load(array[i]);
        if (collateral) {
          const collateralToken = TokenEntity.load(collateral.collateralToken);
          if (collateralToken) {
            if (collateralToken.price) {
              collateralValue = collateralValue.plus(formatUnits(collateral.collateralAmount, collateralToken.decimals).times(collateralToken.price!))
            }
          }
        }

        if (acquired) {
          const acquiredToken = TokenEntity.load(acquired.acquiredToken);
          if (acquiredToken && acquiredToken.price) {
            // logic for bids
            for (let j = 0; j < pos.bids.length; j++) {
              const bidId = pos.bids[j];
              const bid = BidEntity.load(bidId)
              if (bid && bid.open) {
                bidsValue = bidsValue.plus(formatUnits(bid.amount, acquiredToken.decimals).times(acquiredToken.price!))
              }
            }
          }
        }

        const depositToken = TokenEntity.load(position.depositToken);
        // deposit token logic
        if (pawnshop && depositToken) {
          if (depositToken.price) {
            depositTokenValue = depositTokenValue.plus(formatUnits(pawnshop.positionDepositAmount, depositToken.decimals).times(depositToken.price!))
          }
        }
      }
    }

    tvl.collateralValue = collateralValue;
    tvl.depositTokenValue = depositTokenValue;
    tvl.bidsValue = bidsValue;
    tvl.value = tvl.depositTokenValue.plus(tvl.collateralValue).plus(bidsValue);
    tvl.save();

    updateTvlHistory(tvl, block, position);
  }
}

function updateTvlHistory(tvl: TvlEntity, block: ethereum.Block, position: PositionEntity): void {
  const id = `${position.id}-${block.number}`
  let tvlHistory = TvlHistoryEntity.load(id);
  if (!tvlHistory) {
    tvlHistory = new TvlHistoryEntity(id);
    tvlHistory.depositTokenValue = tvl.depositTokenValue;
    tvlHistory.collateralValue = tvl.collateralValue;
    tvlHistory.value = tvl.value;
    tvlHistory.bidsValue = tvl.bidsValue;
    tvlHistory.timestamp = block.timestamp;
    tvlHistory.createAtBlock = block.number;
    tvlHistory.save();
  }
}

function getTvl(): TvlEntity {
  let tvl = TvlEntity.load(CONST_ID);
  if (!tvl) {
    tvl = new TvlEntity(CONST_ID);
    tvl.depositTokenValue = BigDecimal.zero();
    tvl.value = BigDecimal.zero();
    tvl.collateralValue = BigDecimal.zero();
    tvl.bidsValue = BigDecimal.zero();
    tvl.activePositions = []
    tvl.save();
  }
  return tvl;
}