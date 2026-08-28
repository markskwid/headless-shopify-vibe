import type { CustomerOrder } from "../schemas/customer";

export function getFulfilledOrderCount(orders: CustomerOrder[]) {
  return orders.filter(
    (order) => order.fulfillmentStatus === "FULFILLED",
  ).length;
}
