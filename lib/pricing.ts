export function calcPrice(basePrice: number, extraDay: number, extra: number) {
  return basePrice + extraDay * Math.max(0, extra);
}
