
export function roundNumber(val: number): number {
    return Math.round((val + Number.EPSILON) * 100) / 100;
  }