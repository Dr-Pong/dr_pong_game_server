export function eloChangeCulculator(
  user1Lp: number,
  user2Lp: number,
  isUser1Win: boolean,
  isDraw: boolean,
): number {
  if (isDraw) {
    return 0;
  }
  const we = 1.0 / (Math.pow(10.0, (user2Lp - user1Lp) / 400.0) + 1.0);
  let change = 50 * ((isUser1Win ? 1 : 0) - we);
  if (change < 0) {
    change = change * 0.9;
  }
  return Math.round(change);
}
