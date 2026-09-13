import { OrderEventType, OrderStatus } from "@prisma/client";

export function getOrderEventType(
  nextStatus: OrderStatus
): OrderEventType {
  switch (nextStatus) {
    case OrderStatus.CONFIRMED:
      return OrderEventType.ORDER_CONFIRMED;

    case OrderStatus.PREPARING:
      return OrderEventType.ORDER_PREPARING;

    case OrderStatus.READY:
      return OrderEventType.ORDER_READY;

    case OrderStatus.COMPLETED:
      return OrderEventType.ORDER_COMPLETED;

    case OrderStatus.CANCELLED:
      return OrderEventType.ORDER_CANCELLED;

    case OrderStatus.PENDING:
      throw new Error(
        "PENDING cannot be the target of an order transition."
      );

    default:
      throw new Error(
        `Unsupported order status: ${nextStatus}`
      );
  }
}
