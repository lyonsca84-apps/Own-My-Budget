// SOT keywords: firebase admin, getDb, getAuth
//
// Thin adapter around the firebase-admin SDK singleton (per CLAUDE.md's
// vendor-isolation rule). admin.initializeApp() itself still happens in
// server.ts alongside the credential parsing; this module only provides a
// safe, shared way for middleware.ts and services/*.ts to reach the
// resulting Firestore/Auth clients without each redefining the same
// null-check.

import "./server-only";
import admin from "firebase-admin";

export function getDb() {
  if (!admin.apps.length) throw new Error("Firebase Admin not initialized");
  return admin.firestore();
}

export function getAuth() {
  if (!admin.apps.length) throw new Error("Firebase Admin not initialized");
  return admin.auth();
}
