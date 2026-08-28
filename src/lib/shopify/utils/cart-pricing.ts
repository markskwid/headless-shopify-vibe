import type { CartSnapshot } from "../schemas/cart";

export function getCartSubtotal(cart: CartSnapshot) {
  const originalAmount = Number(cart.cost.subtotalAmount.amount);
  const allocatedDiscount = cart.lines.nodes.reduce(
    (cartTotal, line) =>
      cartTotal +
      line.discountAllocations.reduce(
        (lineTotal, allocation) =>
          lineTotal + Number(allocation.discountedAmount.amount),
        0,
      ),
    0,
  );
  const calculatedAmount = Math.max(0, originalAmount - allocatedDiscount);
  const checkoutAmount = Number(cart.cost.totalAmount.amount);
  const discountedAmount = Math.min(calculatedAmount, checkoutAmount);

  return {
    originalAmount,
    discountedAmount,
    currencyCode: cart.cost.subtotalAmount.currencyCode,
    hasDiscount: discountedAmount < originalAmount - 0.005,
  };
}
