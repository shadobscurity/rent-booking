export function calcPrice(basePrice: number, extraDay: number, extra: number) {
  return Number(basePrice) + Number(extraDay) * Math.max(0, Number(extra));
}
