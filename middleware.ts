// SOT keywords: org gate, requireGate, ensureOrgForUser, protectedProcedure equivalent
//
// This is the Layer-2 "Middleware Block" for org-scoped resources (see
// CLAUDE.md section 2). Express has no protectedProcedure, so requireGate()
// is this app's equivalent single security gateway: it verifies auth,
// resolves org membership + usage, and evaluates the resources.ts SOT gate
// before any route handler runs.

import type { Request, Response, NextFunction } from "express";
import admin from "firebase-admin";
import {
  RESOURCES,
  ROLES,
  PLAN_KEYS,
  evaluateFeatureGate,
  type ResourceKey,
  type Operation,
  type Role,
  type PlanKey,
  type UsageCache,
} from "./resources";

declare global {
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

function getDb() {
  if (!admin.apps.length) throw new Error("Firebase Admin not initialized");
  return admin.firestore();
}

function getAuth() {
  if (!admin.apps.length) throw new Error("Firebase Admin not initialized");
  return admin.auth();
}

/**
 * Verifies the bearer token on an incoming request. Throws on a missing,
 * malformed, or invalid/expired token.
 */
export async function verifyToken(req: Request): Promise<admin.auth.DecodedIdToken> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Missing or malformed Authorization header");
  }
  const idToken = authHeader.split("Bearer ")[1];
  return getAuth().verifyIdToken(idToken);
}

/**
 * Idempotently resolves the org a user belongs to, auto-provisioning a
 * personal FREE-plan org (user as owner) on first gated request. Runs in
 * a transaction so two concurrent gated requests for a brand-new user
 * can't race into creating two orgs.
 */
export async function ensureOrgForUser(
  uid: string,
  email: string
): Promise<{ orgId: string; orgRole: Role }> {
  const db = getDb();
  const userRef = db.collection("users").doc(uid);

  return db.runTransaction(async (tx) => {
    const userSnap = await tx.get(userRef);
    const existingOrgId = userSnap.exists
      ? (userSnap.data()?.orgId as string | undefined)
      : undefined;

    if (existingOrgId) {
      const memberRef = db
        .collection("organizations")
        .doc(existingOrgId)
        .collection("members")
        .doc(uid);
      const memberSnap = await tx.get(memberRef);
      const orgRole = memberSnap.exists
        ? (memberSnap.data()?.orgRole as Role | undefined)
        : undefined;
      if (orgRole) {
        return { orgId: existingOrgId, orgRole };
      }
    }

    const orgRef = db.collection("organizations").doc();
    const memberRef = orgRef.collection("members").doc(uid);

    tx.set(orgRef, {
      name: `${email}'s Organization`,
      ownerUid: uid,
      plan: PLAN_KEYS.FREE,
      usage: {},
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    tx.set(memberRef, {
      uid,
      orgId: orgRef.id,
      orgRole: ROLES.OWNER,
      email,
      joinedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    tx.set(userRef, { orgId: orgRef.id }, { merge: true });

    return { orgId: orgRef.id, orgRole: ROLES.OWNER };
  });
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

      const orgSnap = await getDb().collection("organizations").doc(orgId).get();
      const orgData = orgSnap.data();
      const plan = (orgData?.plan as PlanKey | undefined) ?? PLAN_KEYS.FREE;
      const storedUsage = (orgData?.usage as Partial<Record<ResourceKey, number>> | undefined) ?? {};

      const consumed = (Object.keys(RESOURCES) as ResourceKey[]).reduce((acc, key) => {
        acc[key] = storedUsage[key] ?? 0;
        return acc;
      }, {} as Record<ResourceKey, number>);

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
