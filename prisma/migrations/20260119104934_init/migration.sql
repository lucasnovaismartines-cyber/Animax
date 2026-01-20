-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "plan" TEXT NOT NULL DEFAULT 'basic',
    "maxAgeRating" INTEGER DEFAULT 16,
    "emailVerified" BOOLEAN DEFAULT false,
    "avatarUrl" TEXT,
    "lastPaymentAt" TEXT,
    "subscriptionStartedAt" TEXT,
    "subscriptionEndsAt" TEXT,
    "subscriptionPrice" REAL,
    "lastSubscriptionStatus" TEXT,
    "lastPaymentMethod" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
