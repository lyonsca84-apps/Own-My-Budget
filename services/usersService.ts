// SOT keywords: admin users, list users, update role, delete user
//
// Service layer for the admin user-management endpoints. Extracted from
// server.ts's /api/admin/users routes so those routes just orchestrate
// (auth check -> service call -> response) and never touch Firebase Admin
// clients directly.

import "../server-only";
import { getAuth, getDb } from "../firebaseAdmin";

export type AccountRole = "user" | "admin" | "premium" | "client";

export interface UserProfile {
  uid: string;
  email: string | undefined;
  displayName: string | undefined;
  photoURL: string | undefined;
  lastSignInTime: string;
  creationTime: string;
  profile: FirebaseFirestore.DocumentData | null;
}

export async function listAllUsers(): Promise<UserProfile[]> {
  const auth = getAuth();
  const db = getDb();

  const listUsersResult = await auth.listUsers(1000);
  return Promise.all(
    listUsersResult.users.map(async (user): Promise<UserProfile> => {
      const doc = await db.collection("users").doc(user.uid).get();
      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        lastSignInTime: user.metadata.lastSignInTime,
        creationTime: user.metadata.creationTime,
        profile: doc.exists ? (doc.data() ?? null) : null,
      };
    })
  );
}

export async function updateUserRole(uid: string, role: AccountRole): Promise<void> {
  await getDb().collection("users").doc(uid).update({ role });
}

export async function deleteUserAccount(uid: string): Promise<void> {
  await getAuth().deleteUser(uid);
  await getDb().collection("users").doc(uid).delete();
}
