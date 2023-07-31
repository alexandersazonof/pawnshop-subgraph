import { BigDecimal, BigInt } from '@graphprotocol/graph-ts';

export function exponentToBigDecimal(decimals: number): BigDecimal {
  let bd = BigDecimal.fromString('1')
  for (let i = 0; i < decimals; i++) {
    bd = bd.times(BigDecimal.fromString('10'))
  }
  return bd
}

export function formatUnits(amount: BigInt, decimals: number): BigDecimal {
  return amount.toBigDecimal().div(exponentToBigDecimal(decimals))
}
