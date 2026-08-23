// SOT keywords: organizations, org membership, ensureOrgForUser, usage counters
//
// Service layer for the organizations/{orgId} data model (see src/types.ts).
// This is the only module allowed to touch Firestore for org data; callers
// (middleware.ts) orchestrate but never query directly.

import "../server-only";
import admin from "firebase-admin";
import { getDb } from "../firebaseAdmin";
import { RESOURCES, ROLES, PLAN_KEYS, type Role, type PlanKey, type ResourceKey } from "../resources";

/**
 * Idempotently resolves the org a user belongs to, auto-provisioning a
 * personal FREE-plan org (user as owner) on first call. Runs in a
 * transaction so two concurrent calls for a brand-new user can't race into
 * creating two orgs.
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
 * Reads an org's current plan and per-resource usage counters, defaulting
 * missing counters to 0 so evaluateFeatureGate always sees a complete map.
 */
export async function getOrgPlanAndUsage(
  orgId: string
): Promise<{ plan: PlanKey; consumed: Record<ResourceKey, number> }> {
  const orgSnap = await getDb().collection("organizations").doc(orgId).get();
  const orgData = orgSnap.data();
  const plan = (orgData?.plan as PlanKey | undefined) ?? PLAN_KEYS.FREE;
  const storedUsage = (orgData?.usage as Partial<Record<ResourceKey, number>> | undefined) ?? {};

  const consumed = (Object.keys(RESOURCES) as ResourceKey[]).reduce((acc, key) => {
    acc[key] = storedUsage[key] ?? 0;
    return acc;
  }, {} as Record<ResourceKey, number>);

  return { plan, consumed };
}
