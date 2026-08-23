// SOT keywords: admin analytics, net worth aggregation, signups by month
//
// Service layer for the admin analytics endpoint. Extracted from
// server.ts's /api/admin/analytics route.

import "../server-only";
import { getDb } from "../firebaseAdmin";

export interface Analytics {
  totalUsers: number;
  totalNetWorth: number;
  avgNetWorth: number;
  signupsByMonth: { name: string; count: number }[];
}

export async function getAnalytics(): Promise<Analytics> {
  const db = getDb();
  const usersSnapshot = await db.collection("users").get();
  const users = usersSnapshot.docs.map((doc) => doc.data());

  const totalUsers = users.length;
  const totalNetWorth = users.reduce(
    (sum, u) => sum + (typeof u.netWorth === "number" ? u.netWorth : 0),
    0
  );
  const avgNetWorth = totalUsers > 0 ? totalNetWorth / totalUsers : 0;

  const signupsByMonth: Record<string, number> = {};
  users.forEach((u) => {
    const createdAt = u.createdAt;
    if (!createdAt) return;
    const date =
      typeof createdAt.toDate === "function" ? createdAt.toDate() : new Date(createdAt);
    const month = date.toLocaleString("default", { month: "short", year: "2-digit" });
    signupsByMonth[month] = (signupsByMonth[month] || 0) + 1;
  });

  return {
    totalUsers,
    totalNetWorth,
    avgNetWorth,
    signupsByMonth: Object.entries(signupsByMonth).map(([name, count]) => ({ name, count })),
  };
}
