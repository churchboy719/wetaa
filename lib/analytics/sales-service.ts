import { OrderStatus, PaymentStatus } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";

type GetSalesSummaryInput = {
  businessId: string;
  locationId: string;
  from: Date;
  to: Date;
};

export async function getSalesSummary({
  businessId,
  locationId,
  from,
  to,
}: GetSalesSummaryInput) {
  const orders = await prisma.order.findMany({
    where: {
      businessId,
      locationId,
      status: OrderStatus.COMPLETED,
      createdAt: {
        gte: from,
        lt: to,
      },
    },
    select: {
      id: true,
      subtotal: true,
      tax: true,
      discount: true,
      tip: true,
      total: true,
      paidAmount: true,
      currency: true,
    },
  });

  const payments = await prisma.payment.findMany({
    where: {
      order: {
        businessId,
        locationId,
      },
      status: PaymentStatus.COMPLETED,
      createdAt: {
        gte: from,
        lt: to,
      },
    },
    select: {
      amount: true,
    },
  });

  const orderCount = orders.length;

  const subtotal = orders.reduce(
    (sum, order) => sum + order.subtotal,
    0
  );

  const tax = orders.reduce(
    (sum, order) => sum + order.tax,
    0
  );

  const discounts = orders.reduce(
    (sum, order) => sum + order.discount,
    0
  );

  const tips = orders.reduce(
    (sum, order) => sum + order.tip,
    0
  );

  const totalSales = orders.reduce(
    (sum, order) => sum + order.total,
    0
  );

  const collectedAmount = payments.reduce(
    (sum, payment) => sum + payment.amount,
    0
  );

  const outstandingAmount = orders.reduce(
    (sum, order) =>
      sum + Math.max(order.total - order.paidAmount, 0),
    0
  );

  return {
    orderCount,
    subtotal,
    tax,
    discounts,
    tips,
    totalSales,
    collectedAmount,
    outstandingAmount,
    currency: orders[0]?.currency ?? null,
  };
}
