import { OrderStatus } from "@prisma/client";

const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
  PENDING: [
    OrderStatus.CONFIRMED,
    OrderStatus.CANCELLED,
  ],

  CONFIRMED: [
    OrderStatus.PREPARING,
    OrderStatus.CANCELLED,
  ],

  PREPARING: [
    OrderStatus.READY,
    OrderStatus.CANCELLED,
  ],

  READY: [
    OrderStatus.COMPLETED,
    OrderStatus.CANCELLED,
  ],

  COMPLETED: [],

  CANCELLED: [],
};

export function canTransitionOrder(
  currentStatus: OrderStatus,
  nextStatus: OrderStatus
): boolean {
  return allowedTransitions[currentStatus].includes(nextStatus);
}

export function getAllowedOrderTransitions(
  currentStatus: OrderStatus
): OrderStatus[] {
  return allowedTransitions[currentStatus];
}
