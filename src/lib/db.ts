/**
 * Developed by BLACK GOLD STUDIOS and Lucas Novais Martines
 */
import 'server-only';
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { env } from "./env";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const connectionString = env.DATABASE_URL;

let adapter;

if (connectionString.startsWith("postgres")) {
  const pool = new Pool({ connectionString });
  adapter = new PrismaPg(pool);
} else {
  // Remove "file:" prefix if present for better-sqlite3
  const filePath = connectionString.replace("file:", "");
  adapter = new PrismaBetterSqlite3({ url: filePath });
}

export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  plan: string;
  maxAgeRating?: number | null;
  emailVerified?: boolean | null;
  avatarUrl?: string | null;
  lastPaymentAt?: string | null;
  subscriptionStartedAt?: string | null;
  subscriptionEndsAt?: string | null;
  subscriptionPrice?: number | null;
  lastSubscriptionStatus?: string | null;
  lastPaymentMethod?: string | null;
  verificationCode?: string | null;
  verificationCodeExpires?: Date | null;
}

export async function getUsers(): Promise<User[]> {
  const users = await prisma.user.findMany();
  return users.map(toUserInterface);
}

export async function saveUser(user: User): Promise<void> {
  await prisma.user.create({
    data: {
      id: user.id,
      name: user.name,
      email: user.email,
      password: user.password,
      plan: user.plan,
      maxAgeRating: user.maxAgeRating,
      emailVerified: user.emailVerified,
      avatarUrl: user.avatarUrl,
      lastPaymentAt: user.lastPaymentAt,
      subscriptionStartedAt: user.subscriptionStartedAt,
      subscriptionEndsAt: user.subscriptionEndsAt,
      subscriptionPrice: user.subscriptionPrice,
      lastSubscriptionStatus: user.lastSubscriptionStatus,
      lastPaymentMethod: user.lastPaymentMethod,
      verificationCode: user.verificationCode,
      verificationCodeExpires: user.verificationCodeExpires,
    },
  });
}

export async function findUserByEmail(email: string): Promise<User | undefined> {
  const user = await prisma.user.findUnique({
    where: { email },
  });
  return user ? toUserInterface(user) : undefined;
}

export async function updateUserByEmail(
  email: string,
  updates: Partial<User>
): Promise<User | null> {
  try {
    const user = await prisma.user.update({
      where: { email },
      data: updates,
    });
    return toUserInterface(user);
  } catch (error) {
    return null;
  }
}

// Helper to ensure type compatibility
function toUserInterface(dbUser: any): User {
  return {
    id: dbUser.id,
    name: dbUser.name,
    email: dbUser.email,
    password: dbUser.password,
    plan: dbUser.plan,
    maxAgeRating: dbUser.maxAgeRating,
    emailVerified: dbUser.emailVerified,
    avatarUrl: dbUser.avatarUrl,
    lastPaymentAt: dbUser.lastPaymentAt,
    subscriptionStartedAt: dbUser.subscriptionStartedAt,
    subscriptionEndsAt: dbUser.subscriptionEndsAt,
    subscriptionPrice: dbUser.subscriptionPrice,
    lastSubscriptionStatus: dbUser.lastSubscriptionStatus,
    lastPaymentMethod: dbUser.lastPaymentMethod,
    verificationCode: dbUser.verificationCode,
    verificationCodeExpires: dbUser.verificationCodeExpires,
  };
}
