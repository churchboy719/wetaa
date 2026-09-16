import {
  OrderStatus,
  PaymentStatus,
} from "@prisma/client";

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
      orderType: true,
      items: {
        select: {
          productId: true,
          productName: true,
          quantity: true,
          subtotal: true,
          tax: true,
        },
      },
    },
  });

  const orderIds = orders.map((order) => order.id);

  const payments =
    orderIds.length > 0
      ? await prisma.payment.findMany({
          where: {
            orderId: {
              in: orderIds,
            },
            status: PaymentStatus.COMPLETED,
            createdAt: {
              gte: from,
              lt: to,
            },
          },
          select: {
            id: true,
            orderId: true,
            amount: true,
            method: true,
            processedById: true,
           processedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            },
           },
          },
        })
      : [];

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

  // ----------------------------------------------------------
  // Payment method breakdown
  // ----------------------------------------------------------

  const paymentMethods = new Map<
    string,
    {
      method: string;
      amount: number;
      transactionCount: number;
    }
  >();

  for (const payment of payments) {
    const existing = paymentMethods.get(payment.method);

    if (existing) {
      existing.amount += payment.amount;
      existing.transactionCount += 1;
    } else {
      paymentMethods.set(payment.method, {
        method: payment.method,
        amount: payment.amount,
        transactionCount: 1,
      });
    }
  }

  // ----------------------------------------------------------
  // Order type breakdown
  // ----------------------------------------------------------

  const orderTypes = new Map<
    string,
    {
      orderType: string;
      orderCount: number;
      totalSales: number;
    }
  >();

  for (const order of orders) {
    const existing = orderTypes.get(order.orderType);

    if (existing) {
      existing.orderCount += 1;
      existing.totalSales += order.total;
    } else {
      orderTypes.set(order.orderType, {
        orderType: order.orderType,
        orderCount: 1,
        totalSales: order.total,
      });
    }
  }

  // ----------------------------------------------------------
  // Product breakdown
  // ----------------------------------------------------------

  const products = new Map<
    string,
    {
      productId: string;
      productName: string;
      quantity: number;
      subtotal: number;
      tax: number;
      total: number;
    }
  >();

  for (const order of orders) {
    for (const item of order.items) {
      const existing = products.get(item.productId);

      const itemTotal =
        item.subtotal + item.tax;

      if (existing) {
        existing.quantity += item.quantity;
        existing.subtotal += item.subtotal;
        existing.tax += item.tax;
        existing.total += itemTotal;
      } else {
        products.set(item.productId, {
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          subtotal: item.subtotal,
          tax: item.tax,
          total: itemTotal,
        });
      }
    }
  }

  // ----------------------------------------------------------
  // Cashier breakdown
  // ----------------------------------------------------------

  const cashiers = new Map<
    string,
    {
      userId: string | null;
      name: string | null;
      email: string | null;
      amountCollected: number;
      transactionCount: number;
    }
  >();

  for (const payment of payments) {
    const key =
      payment.processedById ?? "UNKNOWN";

    const existing = cashiers.get(key);

    if (existing) {
      existing.amountCollected += payment.amount;
      existing.transactionCount += 1;
    } else {
      cashiers.set(key, {
        userId: payment.processedById,
        name: payment.processedBy
  ? [payment.processedBy.firstName, payment.processedBy.lastName]
      .filter(Boolean)
      .join(" ") || null
  : null,
email: payment.processedBy?.email ?? null,
        amountCollected: payment.amount,
        transactionCount: 1,
      });
    }
  }

  return {
    summary: {
      orderCount,
      subtotal,
      tax,
      discounts,
      tips,
      totalSales,
      collectedAmount,
      outstandingAmount,
      currency: orders[0]?.currency ?? null,
    },

    paymentMethods: Array.from(
      paymentMethods.values()
    ),

    orderTypes: Array.from(
      orderTypes.values()
    ),

    products: Array.from(
      products.values()
    ).sort(
      (a, b) => b.total - a.total
    ),

    cashiers: Array.from(
      cashiers.values()
    ).sort(
      (a, b) =>
        b.amountCollected -
        a.amountCollected
    ),
  };
}
