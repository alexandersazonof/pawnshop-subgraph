import {
  PawnshopEntity,
  PositionCollateralEntity,
  PositionEntity,
  TokenEntity,
  TvlEntity, TvlHistoryEntity,
} from '../../generated/schema';
import { CONST_ID } from '../utils/constant';
import { BigDecimal, ethereum, log } from '@graphprotocol/graph-ts';
import { formatUnits } from '../utils/number';
import { loadOrCreatePosition } from './position';

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
    for (let i = 0; i < array.length; i++) {
      const pos = PositionEntity.load(array[i])
      if (pos) {
        // collateral logic
        const collateral = PositionCollateralEntity.load(array[i])
        if (collateral) {
          const collateralToken = TokenEntity.load(collateral.collateralToken);
          if (collateralToken) {
            if (collateralToken.price) {
              collateralValue = collateralValue.plus(formatUnits(collateral.collateralAmount, collateralToken.decimals).times(collateralToken.price!))
            }
          }
        }

        const depositToken = TokenEntity.load(position.depositToken);
        // deposit token logic
        if (pawnshop && depositToken) {
          if (depositToken.price) {
            depositTokenValue = formatUnits(pawnshop.positionDepositAmount, depositToken.decimals).times(depositToken.price!)
          }
        }
      }
    }

    tvl.collateralValue = collateralValue;
    tvl.depositTokenValue = depositTokenValue;
    tvl.value = tvl.depositTokenValue.plus(tvl.collateralValue);
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
    tvl.activePositions = []
    tvl.save();
  }
  return tvl;
}