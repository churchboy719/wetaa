import {
  OrderSource,
  OrderType,
} from "@prisma/client";

export type OrderItemInput = {
  productId: string;
  quantity: number;
  notes?: string;
};

export type DeliveryInput = {
  name: string;
  phone: string;
  email?: string;
  address: string;
  city?: string;
  postalCode?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
};

export type CreateOrderInput = {
  businessId: string;
  locationId: string;

  orderType: OrderType;
  orderSource: OrderSource;

  customerId?: string;
  tableId?: string;

  items: OrderItemInput[];

  tip?: number;
  discount?: number;
  notes?: string;

  delivery?: DeliveryInput;
};
