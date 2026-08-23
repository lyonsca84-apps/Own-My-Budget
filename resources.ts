/**
 * SOURCE OF TRUTH (SOT): Resources, Plans, Roles, and Permissions Registry
 * 
 * This file is the single, non-violable registry defining plan keys, feature gates,
 * resource limits, and role-based permissions. Both client-side UI gates and 
 * server-side tRPC procedures/middleware MUST consume this file to enforce consistency.
 * 
 * TypeScript Lock-In: Types are dynamically derived from this object. Do NOT manually
 * duplicate types. No `any` or `unknown` bypasses allowed.
 */

// 1. Core Tier Keys
export const PLAN_KEYS = {
  FREE: "free",
  STARTER: "starter",
  PRO: "pro",
  PORTAL: "portal", // Special internal bypass/payment-exempt plan
} as const;

export type PlanKey = typeof PLAN_KEYS[keyof typeof PLAN_KEYS];

// 2. Resource Actions / Operations
export const OPERATIONS = {
  CREATE: "create",
  READ: "read",
  UPDATE: "update",
  DELETE: "delete",
} as const;

export type Operation = typeof OPERATIONS[keyof typeof OPERATIONS];

// 3. Organization Member Roles
export const ROLES = {
  OWNER: "owner",
  ADMIN: "admin",
  MEMBER: "member",
  GUEST: "guest",
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

// 4. Resource Definitions & Dynamic Limits Mapping
// Single location to add or alter any app features, plan allocations, and dynamic upgrades.
export const RESOURCES = {
  members: {
    name: "Team Members",
    description: "Manage team collaboration and seat allocations.",
    upgradeMessage: "Your plan permits up to {limit} team members. Upgrade to {nextPlan} to add more collaborators.",
    limits: {
      [PLAN_KEYS.FREE]: 1,
      [PLAN_KEYS.STARTER]: 5,
      [PLAN_KEYS.PRO]: 25,
      [PLAN_KEYS.PORTAL]: 99999,
    },
    allowedOperations: [OPERATIONS.CREATE, OPERATIONS.READ, OPERATIONS.UPDATE, OPERATIONS.DELETE],
  },
  invitations: {
    name: "Team Invitations",
    description: "Invite external members to collaborate in your workspace.",
    upgradeMessage: "Upgrade to {nextPlan} to invite more than {limit} pending members.",
    limits: {
      [PLAN_KEYS.FREE]: 1,
      [PLAN_KEYS.STARTER]: 10,
      [PLAN_KEYS.PRO]: 100,
      [PLAN_KEYS.PORTAL]: 99999,
    },
    // Note: No 'UPDATE' operation on invitations as explicitly configured in the architectural guardrail
    allowedOperations: [OPERATIONS.CREATE, OPERATIONS.READ, OPERATIONS.DELETE],
  },
  organizationRoles: {
    name: "Custom Roles & Permissions",
    description: "Define custom access profiles for granular control.",
    upgradeMessage: "Custom role creation is exclusive to {nextPlan} accounts.",
    limits: {
      [PLAN_KEYS.FREE]: 0,
      [PLAN_KEYS.STARTER]: 2,
      [PLAN_KEYS.PRO]: 10,
      [PLAN_KEYS.PORTAL]: 99999,
    },
    allowedOperations: [OPERATIONS.CREATE, OPERATIONS.READ, OPERATIONS.UPDATE, OPERATIONS.DELETE],
  },
  customBranding: {
    name: "Custom White-Label Branding",
    description: "Remove watermarks and custom brand your workspace.",
    upgradeMessage: "White-label branding requires a {nextPlan} subscription.",
    limits: {
      [PLAN_KEYS.FREE]: 0,
      [PLAN_KEYS.STARTER]: 0,
      [PLAN_KEYS.PRO]: 1,
      [PLAN_KEYS.PORTAL]: 1,
    },
    allowedOperations: [OPERATIONS.READ, OPERATIONS.UPDATE],
  },
  websites: {
    name: "Websites",
    description: "Build responsive, high-performance pages and funnels.",
    upgradeMessage: "Limit of {limit} active websites reached. Upgrade to {nextPlan} to unlock additional sites.",
    limits: {
      [PLAN_KEYS.FREE]: 1,
      [PLAN_KEYS.STARTER]: 3,
      [PLAN_KEYS.PRO]: 20,
      [PLAN_KEYS.PORTAL]: 99999,
    },
    allowedOperations: [OPERATIONS.CREATE, OPERATIONS.READ, OPERATIONS.UPDATE, OPERATIONS.DELETE],
  },
} as const;

export type ResourceKey = keyof typeof RESOURCES;

// 5. Typescript Lock-In Types (Dynamically Generated, Zero Hardcoding)
// Ensure no "any" or "unknown" can be slipped in when checking dynamic permissions.

export type AllowedOperationMap<R extends ResourceKey> = 
  typeof RESOURCES[R]["allowedOperations"][number];

export type ResourcePermissions = {
  [R in ResourceKey]: {
    [O in AllowedOperationMap<R>]: boolean;
  };
};

export type PermissionString = {
  [R in ResourceKey]: `${R}:${AllowedOperationMap<R>}`
}[ResourceKey];

// Role mapping table matching organizational hierarchy permissions
export const ROLE_PERMISSIONS: Record<Role, Partial<Record<PermissionString, boolean>>> = {
  [ROLES.OWNER]: {
    "members:create": true, "members:read": true, "members:update": true, "members:delete": true,
    "invitations:create": true, "invitations:read": true, "invitations:delete": true,
    "organizationRoles:create": true, "organizationRoles:read": true, "organizationRoles:update": true, "organizationRoles:delete": true,
    "customBranding:read": true, "customBranding:update": true,
    "websites:create": true, "websites:read": true, "websites:update": true, "websites:delete": true,
  },
  [ROLES.ADMIN]: {
    "members:create": true, "members:read": true, "members:update": true, "members:delete": false,
    "invitations:create": true, "invitations:read": true, "invitations:delete": true,
    "organizationRoles:create": false, "organizationRoles:read": true, "organizationRoles:update": false, "organizationRoles:delete": false,
    "customBranding:read": true, "customBranding:update": false,
    "websites:create": true, "websites:read": true, "websites:update": true, "websites:delete": true,
  },
  [ROLES.MEMBER]: {
    "members:create": false, "members:read": true, "members:update": false, "members:delete": false,
    "invitations:create": false, "invitations:read": true, "invitations:delete": false,
    "organizationRoles:create": false, "organizationRoles:read": true, "organizationRoles:update": false, "organizationRoles:delete": false,
    "customBranding:read": true, "customBranding:update": false,
    "websites:create": true, "websites:read": true, "websites:update": true, "websites:delete": false,
  },
  [ROLES.GUEST]: {
    "members:create": false, "members:read": true, "members:update": false, "members:delete": false,
    "invitations:create": false, "invitations:read": true, "invitations:delete": false,
    "organizationRoles:create": false, "organizationRoles:read": true, "organizationRoles:update": false, "organizationRoles:delete": false,
    "customBranding:read": false, "customBranding:update": false,
    "websites:create": false, "websites:read": true, "websites:update": false, "websites:delete": false,
  },
};

// 6. Globalized Dynamic Helpers & Safe Evaluators (Shared Client/Server)
export interface UsageCache {
  plan: PlanKey;
  consumed: Record<ResourceKey, number>;
}

export interface GateResult {
  allowed: boolean;
  reason: "PLAN_LIMIT_REACHED" | "UNAUTHORIZED_OPERATION" | "ROLE_UNAUTHORIZED" | "OK";
  upgradeMessage?: string;
}

/**
 * Formats a dynamically generated user upgrade message using template parameters.
 */
export function formatUpgradeMessage(
  resourceKey: ResourceKey,
  currentPlan: PlanKey,
  nextPlan: PlanKey = PLAN_KEYS.PRO
): string {
  const resource = RESOURCES[resourceKey];
  const limit = resource.limits[currentPlan];
  const formattedNextPlan = nextPlan.toUpperCase();
  
  return resource.upgradeMessage
    .replace("{limit}", limit.toString())
    .replace("{nextPlan}", formattedNextPlan);
}

/**
 * Globalized, decoupled evaluator checking role access, action allowance, and plan capacity limits.
 * Intended for inline procedural checks in tRPC middleware and React/React Native frontend overlays.
 */
export function evaluateFeatureGate(params: {
  resource: ResourceKey;
  operation: Operation;
  role: Role;
  usage: UsageCache;
  nextPlan?: PlanKey;
}): GateResult {
  const { resource, operation, role, usage, nextPlan = PLAN_KEYS.PRO } = params;
  const config = RESOURCES[resource];

  // A. Check if the raw operation is valid for this resource definition
  const isOperationAllowed = (config.allowedOperations as readonly string[]).includes(operation);
  if (!isOperationAllowed) {
    return { allowed: false, reason: "UNAUTHORIZED_OPERATION" };
  }

  // B. Check standard Role-Based Permissions
  const permissionKey = `${resource}:${operation}` as PermissionString;
  const isRoleAllowed = ROLE_PERMISSIONS[role]?.[permissionKey] ?? false;
  if (!isRoleAllowed) {
    return { allowed: false, reason: "ROLE_UNAUTHORIZED" };
  }

  // C. Evaluate Plan Usage Allocations
  const limit = config.limits[usage.plan];
  const consumed = usage.consumed[resource] ?? 0;
  if (consumed >= limit) {
    return {
      allowed: false,
      reason: "PLAN_LIMIT_REACHED",
      upgradeMessage: formatUpgradeMessage(resource, usage.plan, nextPlan),
    };
  }

  return { allowed: true, reason: "OK" };
}
