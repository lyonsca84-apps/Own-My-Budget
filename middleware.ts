// SOT keywords: org gate, requireGate, protectedProcedure equivalent
//
// This is the Layer-2 "Middleware Block" for org-scoped resources (see
// CLAUDE.md section 2). Express has no protectedProcedure, so requireGate()
// is this app's equivalent single security gateway: it verifies auth,
// resolves org membership + usage via the Service layer (services/orgService),
// and evaluates the resources.ts SOT gate before any route handler runs.
//
// This file itself never queries Firestore directly — per CLAUDE.md's
// three-layer split, that's the Service layer's job.

import type { Request, Response, NextFunction } from "express";
import type { auth as adminAuth } from "firebase-admin";
import { getAuth } from "./firebaseAdmin";
import { ensureOrgForUser, getOrgPlanAndUsage } from "./services/orgService";
import {
  evaluateFeatureGate,
  type ResourceKey,
  type Operation,
  type Role,
  type PlanKey,
  type UsageCache,
} from "./resources";

declare global {
  // Ambient augmentation of Express's Request type has no ES2015-module equivalent.
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      orgContext?: {
        uid: string;
        orgId: string;
        orgRole: Role;
        plan: PlanKey;
      };
    }
  }
}

/**
 * Verifies the bearer token on an incoming request. Throws on a missing,
 * malformed, or invalid/expired token.
 */
export async function verifyToken(req: Request): Promise<adminAuth.DecodedIdToken> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Missing or malformed Authorization header");
  }
  const idToken = authHeader.split("Bearer ")[1];
  return getAuth().verifyIdToken(idToken);
}

/**
 * Express middleware factory enforcing the resources.ts SOT gate for a
 * given resource + operation. On success, attaches req.orgContext and
 * calls next(); on failure, responds with the gate's reason and, for plan
 * limits, its upgradeMessage.
 */
export function requireGate(resource: ResourceKey, operation: Operation) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const decoded = await verifyToken(req);
      const { orgId, orgRole } = await ensureOrgForUser(decoded.uid, decoded.email ?? "");
      const { plan, consumed } = await getOrgPlanAndUsage(orgId);

      const usage: UsageCache = { plan, consumed };
      const gate = evaluateFeatureGate({ resource, operation, role: orgRole, usage });

      if (!gate.allowed) {
        const status = gate.reason === "PLAN_LIMIT_REACHED" ? 402 : 403;
        res.status(status).json(gate);
        return;
      }

      req.orgContext = { uid: decoded.uid, orgId, orgRole, plan };
      next();
    } catch (error) {
      console.error(
        `requireGate(${resource}:${operation}) error:`,
        error instanceof Error ? error.message : String(error)
      );
      res.status(401).json({ error: "Unauthorized" });
    }
  };
}
