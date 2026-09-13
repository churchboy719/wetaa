import {
  OrderStatus,
  PaymentStatus,
} from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import { requireLocationPermission } from "@/lib/auth/authorization";
import { permissions } from "@/lib/auth/permissions";

import {
  canTransitionOrder,
} from "./order-transitions";

import {
  getOrderEventType,
} from "./order-events";

type TransitionOrderInput = {
  orderId: string;
  nextStatus: OrderStatus;
  userId: string;
};

export async function transitionOrder({
  orderId,
  nextStatus,
  userId,
}: TransitionOrderInput) {
  const order = await prisma.order.findUnique({
    where: {
      id: orderId,
    },
    include: {
      payments: {
        where: {
          status: PaymentStatus.COMPLETED,
        },
      },
    },
  });

  if (!order) {
    throw new Error("ORDER_NOT_FOUND");
  }

  await requireLocationPermission(
    order.businessId,
    order.locationId,
    permissions.orders.update
  );

  if (
    !canTransitionOrder(
      order.status,
      nextStatus
    )
  ) {
    throw new Error("INVALID_ORDER_TRANSITION");
  }

  if (nextStatus === OrderStatus.COMPLETED) {
    const paidAmount = order.payments.reduce(
      (sum, payment) => sum + payment.amount,
      0
    );

    if (paidAmount < order.total) {
      throw new Error("ORDER_NOT_PAID");
    }
  }

  const eventType = getOrderEventType(nextStatus);

  return prisma.$transaction(async (tx) => {
    const updatedOrder = await tx.order.update({
      where: {
        id: order.id,
      },
      data: {
        status: nextStatus,
      },
    });

    await tx.orderEvent.create({
      data: {
        businessId: order.businessId,
        locationId: order.locationId,
        orderId: order.id,
        type: eventType,
        createdById: userId,
        metadata: {
          previousStatus: order.status,
          nextStatus,
        },
      },
    });

    return updatedOrder;
  });
}
