import { 
  evaluateFeatureGate, 
  PLAN_KEYS, 
  ROLES, 
  OPERATIONS, 
  RESOURCES,
  type UsageCache 
} from "./resources";

/**
 * SOURCE OF TRUTH (SOT): Automated Integration Test Suite
 * 
 * @what Verification suite for security feature gates, tenant limits, and role scopes.
 * @why Ensures that neither manual modifications nor AI agent code drifts bypass crucial billing or security rules.
 * @how Executes pure Jest/Vitest assertions against role permissions and usage limit matrices.
 * @where Run via `npm test` or `vitest` in the root configuration.
 */

describe("Unified Resource & Feature Gate Registry Security Tests", () => {
  
  // 1. ROLE-BASED ACCESS CONTROL (RBAC) TESTS
  describe("Role-Based Security Gates", () => {
    
    it("should allow OWNER to perform all operations on websites", () => {
      const usage: UsageCache = {
        plan: PLAN_KEYS.FREE,
        consumed: { websites: 0, members: 0, invitations: 0, organizationRoles: 0, customBranding: 0 }
      };

      const result = evaluateFeatureGate({
        resource: "websites",
        operation: OPERATIONS.CREATE,
        role: ROLES.OWNER,
        usage
      });

      expect(result.allowed).toBe(true);
      expect(result.reason).toBe("OK");
    });

    it("should block GUEST from creating websites", () => {
      const usage: UsageCache = {
        plan: PLAN_KEYS.FREE,
        consumed: { websites: 0, members: 0, invitations: 0, organizationRoles: 0, customBranding: 0 }
      };

      const result = evaluateFeatureGate({
        resource: "websites",
        operation: OPERATIONS.CREATE,
        role: ROLES.GUEST,
        usage
      });

      expect(result.allowed).toBe(false);
      expect(result.reason).toBe("ROLE_UNAUTHORIZED");
    });

    it("should reject operations that are structurally forbidden for a resource (e.g., UPDATE on invitations)", () => {
      const usage: UsageCache = {
        plan: PLAN_KEYS.PRO,
        consumed: { websites: 0, members: 0, invitations: 0, organizationRoles: 0, customBranding: 0 }
      };

      // Type-casting to force an unsupported operation check
      const result = evaluateFeatureGate({
        resource: "invitations",
        operation: OPERATIONS.UPDATE as any, // structurally forbidden in SOT config
        role: ROLES.OWNER,
        usage
      });

      expect(result.allowed).toBe(false);
      expect(result.reason).toBe("UNAUTHORIZED_OPERATION");
    });
  });

  // 2. BILLING & MULTI-TENANT PLAN LIMIT TESTS
  describe("SaaS Plan Allocations and Feature Gates", () => {

    it("should allow a FREE tier tenant to create exactly 1 website and block the 2nd with a correct upgrade prompt", () => {
      const underLimitUsage: UsageCache = {
        plan: PLAN_KEYS.FREE,
        consumed: { websites: 0, members: 0, invitations: 0, organizationRoles: 0, customBranding: 0 }
      };

      const overLimitUsage: UsageCache = {
        plan: PLAN_KEYS.FREE,
        consumed: { websites: 1, members: 0, invitations: 0, organizationRoles: 0, customBranding: 0 }
      };

      // A. Within limit
      const passResult = evaluateFeatureGate({
        resource: "websites",
        operation: OPERATIONS.CREATE,
        role: ROLES.OWNER,
        usage: underLimitUsage
      });
      expect(passResult.allowed).toBe(true);

      // B. Exceeded limit
      const failResult = evaluateFeatureGate({
        resource: "websites",
        operation: OPERATIONS.CREATE,
        role: ROLES.OWNER,
        usage: overLimitUsage
      });

      expect(failResult.allowed).toBe(false);
      expect(failResult.reason).toBe("PLAN_LIMIT_REACHED");
      expect(failResult.upgradeMessage).toBe(
        "Limit of 1 active websites reached. Upgrade to PRO to unlock additional sites."
      );
    });

    it("should block STARTER tier from accessing custom branding (limit: 0) and promote PRO upgrade", () => {
      const usage: UsageCache = {
        plan: PLAN_KEYS.STARTER,
        consumed: { websites: 0, members: 0, invitations: 0, organizationRoles: 0, customBranding: 0 }
      };

      const result = evaluateFeatureGate({
        resource: "customBranding",
        operation: OPERATIONS.UPDATE,
        role: ROLES.OWNER,
        usage
      });

      expect(result.allowed).toBe(false);
      expect(result.reason).toBe("PLAN_LIMIT_REACHED");
      expect(result.upgradeMessage).toBe(
        "White-label branding requires a PRO subscription."
      );
    });

    it("should allow payment-exempt PORTAL plan users to bypass all standard limits", () => {
      const maxedOutUsage: UsageCache = {
        plan: PLAN_KEYS.PORTAL,
        consumed: { websites: 9999, members: 9999, invitations: 9999, organizationRoles: 9999, customBranding: 0 }
      };

      const result = evaluateFeatureGate({
        resource: "websites",
        operation: OPERATIONS.CREATE,
        role: ROLES.OWNER,
        usage: maxedOutUsage
      });

      expect(result.allowed).toBe(true);
      expect(result.reason).toBe("OK");
    });
  });

  // 3. SECURE MIDDLEWARE COMPLIANCE & ATTACK VECTORS
  describe("Security Middleware Resiliency Checks", () => {

    it("should prevent GUEST users from executing write commands (CREATE, UPDATE, DELETE) across all resources", () => {
      const usage: UsageCache = {
        plan: PLAN_KEYS.PRO,
        consumed: { websites: 0, members: 0, invitations: 0, organizationRoles: 0, customBranding: 0 }
      };

      const resourcesToTest = Object.keys(RESOURCES) as Array<keyof typeof RESOURCES>;
      const destructiveOps = [OPERATIONS.CREATE, OPERATIONS.UPDATE, OPERATIONS.DELETE];

      resourcesToTest.forEach((res) => {
        const config = RESOURCES[res];
        destructiveOps.forEach((op) => {
          // Check if this resource configuration even allows this operation first
          if ((config.allowedOperations as readonly string[]).includes(op)) {
            const result = evaluateFeatureGate({
              resource: res,
              operation: op,
              role: ROLES.GUEST,
              usage
            });

            expect(result.allowed).toBe(false);
            expect(["ROLE_UNAUTHORIZED", "UNAUTHORIZED_OPERATION"]).toContain(result.reason);
          }
        });
      });
    });
  });
});
