import { prisma } from "@/lib/db/prisma";
import { getCurrentSession } from "@/lib/auth/session";
import {
  permissions,
  type Permission,
} from "@/lib/auth/permissions";

type StaffRole =
  | "MANAGER"
  | "CASHIER"
  | "WAITER"
  | "KITCHEN";

type AccessRole = "OWNER" | StaffRole;

type BusinessAccess = {
  userId: string;
  businessId: string;
  role: AccessRole;
  membershipId?: string;
  locationId?: string | null;
};

export async function requireAuth() {
  const session = await getCurrentSession();

  if (!session) {
    throw new Error("UNAUTHORIZED");
  }

  return session.user;
}

export async function requireBusinessAccess(
  businessId: string
): Promise<BusinessAccess> {
  const user = await requireAuth();

  // Business owner
  const business = await prisma.business.findFirst({
    where: {
      id: businessId,
      ownerId: user.id,
    },
  });

  if (business) {
    return {
      userId: user.id,
      businessId,
      role: "OWNER",
    };
  }

  // Staff member
  const membership = await prisma.staffMembership.findFirst({
    where: {
      userId: user.id,
      businessId,
      status: "ACTIVE",
    },
  });

  if (!membership) {
    throw new Error("FORBIDDEN");
  }

  return {
    userId: user.id,
    businessId,
    role: membership.role as StaffRole,
    membershipId: membership.id,
    locationId: membership.locationId,
  };
}

export async function requireLocationAccess(
  businessId: string,
  locationId: string
): Promise<BusinessAccess> {
  const access = await requireBusinessAccess(businessId);

  // Owner has access to all locations
  // belonging to their business.
  if (access.role === "OWNER") {
    const location = await prisma.location.findFirst({
      where: {
        id: locationId,
        businessId,
      },
    });

    if (!location) {
      throw new Error("FORBIDDEN");
    }

    return {
      ...access,
      locationId,
    };
  }

  // Staff must be assigned to this location.
  if (access.locationId !== locationId) {
    throw new Error("FORBIDDEN");
  }

  return access;
}

const rolePermissions: Record<
  StaffRole,
  readonly Permission[]
> = {
  MANAGER: [
    permissions.business.view,
    permissions.business.update,

    permissions.locations.view,
    permissions.locations.manage,

    permissions.staff.view,
    permissions.staff.manage,
    permissions.staff.activate,

    permissions.menu.view,
    permissions.menu.manage,

    permissions.orders.view,
    permissions.orders.create,
    permissions.orders.update,

    permissions.payments.view,
    permissions.payments.process,

    permissions.tables.view,
    permissions.tables.manage,

    permissions.analytics.view,
  ],

  CASHIER: [
    permissions.menu.view,

    permissions.orders.view,
    permissions.orders.create,
    permissions.orders.update,

    permissions.payments.view,
    permissions.payments.process,

    permissions.tables.view,
  ],

  WAITER: [
    permissions.menu.view,

    permissions.orders.view,
    permissions.orders.create,
    permissions.orders.update,

    permissions.tables.view,
  ],

  KITCHEN: [
    permissions.menu.view,

    permissions.orders.view,
    permissions.orders.update,
  ],
};

export function roleHasPermission(
  role: AccessRole,
  permission: Permission
): boolean {
  // Business owners have all permissions.
  if (role === "OWNER") {
    return true;
  }

  return rolePermissions[role].includes(permission);
}

export async function requirePermission(
  businessId: string,
  permission: Permission
) {
  const access = await requireBusinessAccess(businessId);

  if (!roleHasPermission(access.role, permission)) {
    throw new Error("FORBIDDEN");
  }

  return access;
}

export async function requireLocationPermission(
  businessId: string,
  locationId: string,
  permission: Permission
) {
  const access = await requireLocationAccess(
    businessId,
    locationId
  );

  if (!roleHasPermission(access.role, permission)) {
    throw new Error("FORBIDDEN");
  }

  return access;
}

export async function requireActiveStaffPermission(
  businessId: string,
  locationId: string,
  permission: Permission
) {
  const access = await requireLocationPermission(
    businessId,
    locationId,
    permission
  );

  // Owners are always operationally active.
  if (access.role === "OWNER") {
    return access;
  }

  if (!access.membershipId) {
    throw new Error("FORBIDDEN");
  }

  const membership = await prisma.staffMembership.findUnique({
    where: {
      id: access.membershipId,
    },
  });

  if (!membership) {
    throw new Error("FORBIDDEN");
  }

  if (!membership.isActive) {
    throw new Error("STAFF_NOT_ACTIVE");
  }

  return access;
}