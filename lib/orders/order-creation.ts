import {
  OrderEventType,
  OrderSource,
  OrderType,
} from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import { requireLocationPermission } from "@/lib/auth/authorization";
import { permissions } from "@/lib/auth/permissions";

import { calculateTax } from "@/lib/tax/tax-calculator";
import type { TaxPricingMode } from "@/lib/tax/tax-types";

import { generateOrderNumber } from "./order-number";
import type {
  CreateOrderInput,
} from "./order-types";

function validateOrderTypeInput(
  input: CreateOrderInput
) {
  if (input.orderType === OrderType.DINE_IN) {
    if (!input.tableId) {
      throw new Error(
        "DINE_IN_REQUIRES_TABLE"
      );
    }

    if (input.delivery) {
      throw new Error(
        "DINE_IN_CANNOT_HAVE_DELIVERY"
      );
    }
  }

  if (input.orderType === OrderType.TAKEOUT) {
    if (input.tableId) {
      throw new Error(
        "TAKEOUT_CANNOT_HAVE_TABLE"
      );
    }

    if (input.delivery) {
      throw new Error(
        "TAKEOUT_CANNOT_HAVE_DELIVERY"
      );
    }
  }

  if (input.orderType === OrderType.DELIVERY) {
    if (input.tableId) {
      throw new Error(
        "DELIVERY_CANNOT_HAVE_TABLE"
      );
    }

    if (!input.delivery) {
      throw new Error(
        "DELIVERY_REQUIRES_DELIVERY_DETAILS"
      );
    }
  }
}

async function createOrderCore(
  input: CreateOrderInput,
  createdById?: string
) {
  if (!input.items.length) {
    throw new Error("ORDER_REQUIRES_ITEMS");
  }

  validateOrderTypeInput(input);

  // Staff-created orders require location permission.
  // QR-created orders are authorized by the resolved QR code.

  const location =
    await prisma.location.findUnique({
      where: {
        id: input.locationId,
      },
    });

  if (!location) {
    throw new Error("LOCATION_NOT_FOUND");
  }

  if (location.businessId !== input.businessId) {
    throw new Error(
      "LOCATION_NOT_IN_BUSINESS"
    );
  }

  const taxPricingMode =
    location.taxPricingMode as TaxPricingMode;

  const products =
    await prisma.product.findMany({
      where: {
        id: {
          in: input.items.map(
            (item) => item.productId
          ),
        },
        active: true,
        available: true,
      },
      include: {
        taxRule: true,
        category: {
          include: {
            menu: true,
          },
        },
      },
    });

  if (
    products.length !==
    new Set(
      input.items.map(
        (item) => item.productId
      )
    ).size
  ) {
    throw new Error(
      "ONE_OR_MORE_PRODUCTS_NOT_AVAILABLE"
    );
  }

  const productMap = new Map(
    products.map((product) => [
      product.id,
      product,
    ])
  );

  let subtotal = 0;
  let tax = 0;

  const orderItems = input.items.map(
    (item) => {
      if (
        !Number.isInteger(item.quantity) ||
        item.quantity <= 0
      ) {
        throw new Error(
          "INVALID_ITEM_QUANTITY"
        );
      }

      const product =
        productMap.get(item.productId);

      if (!product) {
        throw new Error(
          "PRODUCT_NOT_AVAILABLE"
        );
      }

      if (
        product.category.menu.locationId !==
        input.locationId
      ) {
        throw new Error(
          "PRODUCT_NOT_IN_LOCATION"
        );
      }

      const taxRate =
        location.taxEnabled &&
        product.taxRule?.active
          ? product.taxRule.rate
          : 0;

      const calculation =
        calculateTax({
          unitPrice: product.price,
          quantity: item.quantity,
          taxRate,
          pricingMode:
            taxPricingMode,
        });

      subtotal += calculation.subtotal;
      tax += calculation.tax;

      return {
        productId: product.id,
        productName: product.name,
        unitPrice: product.price,
        quantity: item.quantity,
        subtotal: calculation.subtotal,
        taxRuleName:
          product.taxRule?.name ?? null,
        taxRate,
        tax: calculation.tax,
        notes: item.notes,
      };
    }
  );

  const discount =
    input.discount ?? 0;

  const tip =
    input.tip ?? 0;

  if (
    !Number.isInteger(discount) ||
    discount < 0
  ) {
    throw new Error(
      "INVALID_DISCOUNT"
    );
  }

  if (
    !Number.isInteger(tip) ||
    tip < 0
  ) {
    throw new Error("INVALID_TIP");
  }

  if (!location.tipsEnabled && tip > 0) {
    throw new Error(
      "TIPS_NOT_ENABLED"
    );
  }

  if (
    tip > 0 &&
    !location.allowCustomTip &&
    !location.suggestedTipAmounts.includes(
      tip
    )
  ) {
    throw new Error(
      "TIP_AMOUNT_NOT_ALLOWED"
    );
  }

  if (discount > subtotal + tax) {
    throw new Error(
      "DISCOUNT_EXCEEDS_ORDER_VALUE"
    );
  }

  const total =
    subtotal +
    tax -
    discount +
    tip;

  const orderNumber =
    generateOrderNumber();

  return prisma.$transaction(
    async (tx) => {
      const order =
        await tx.order.create({
          data: {
            orderNumber,

            businessId:
              input.businessId,

            locationId:
              input.locationId,

            customerId:
              input.customerId,

            tableId:
              input.tableId,

            orderType:
              input.orderType,

            orderSource:
              input.orderSource,

            createdById,

            status: "PENDING",

            subtotal,
            tax,
            discount,
            tip,
            total,

            currency:
              location.currency,

            notes:
              input.notes,

            deliveryName:
              input.delivery?.name,

            deliveryPhone:
              input.delivery?.phone,

            deliveryEmail:
              input.delivery?.email,

            deliveryAddress:
              input.delivery?.address,

            deliveryCity:
              input.delivery?.city,

            deliveryPostalCode:
              input.delivery?.postalCode,

            deliveryCountry:
              input.delivery?.country,

            deliveryLatitude:
              input.delivery?.latitude,

            deliveryLongitude:
              input.delivery?.longitude,

            items: {
              create: orderItems,
            },
          },

          include: {
            items: true,
          },
        });

      await tx.orderEvent.create({
        data: {
          businessId:
            input.businessId,

          locationId:
            input.locationId,

          orderId:
            order.id,

          type:
            OrderEventType.ORDER_CREATED,

          createdById,

          metadata: {
            orderType:
              input.orderType,

            orderSource:
              input.orderSource,
          },
        },
      });

      return order;
    }
  );
}
export async function createStaffOrder(
  input: CreateOrderInput,
  createdById: string
) {
  await requireLocationPermission(
    input.businessId,
    input.locationId,
    permissions.orders.create
  );

  return createOrderCore(input, createdById);
}
export async function createQROrder(
  input: CreateOrderInput
) {
  return createOrderCore(input);
}