export const permissions = {
  business: {
    view: "business:view",
    update: "business:update",
  },

  locations: {
    view: "locations:view",
    manage: "locations:manage",
  },

  staff: {
    view: "staff:view",
    manage: "staff:manage",
    activate: "staff:activate",
  },

  menu: {
    view: "menu:view",
    manage: "menu:manage",
  },

  orders: {
    view: "orders:view",
    create: "orders:create",
    update: "orders:update",
  },

  payments: {
    view: "payments:view",
    process: "payments:process",
  },

  tables: {
    view: "tables:view",
    manage: "tables:manage",
  },

  analytics: {
    view: "analytics:view",
  },
} as const;

export type Permission =
  | (typeof permissions.business)[keyof typeof permissions.business]
  | (typeof permissions.locations)[keyof typeof permissions.locations]
  | (typeof permissions.staff)[keyof typeof permissions.staff]
  | (typeof permissions.menu)[keyof typeof permissions.menu]
  | (typeof permissions.orders)[keyof typeof permissions.orders]
  | (typeof permissions.payments)[keyof typeof permissions.payments]
  | (typeof permissions.tables)[keyof typeof permissions.tables]
  | (typeof permissions.analytics)[keyof typeof permissions.analytics];