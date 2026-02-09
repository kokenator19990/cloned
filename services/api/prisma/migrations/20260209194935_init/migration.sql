-- CreateEnum
CREATE TYPE "ProfileStatus" AS ENUM ('ENROLLING', 'ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "CognitiveCategory" AS ENUM ('LINGUISTIC', 'LOGICAL', 'MORAL', 'VALUES', 'ASPIRATIONS', 'PREFERENCES', 'AUTOBIOGRAPHICAL', 'EMOTIONAL');

-- CreateEnum
CREATE TYPE "MessageRole" AS ENUM ('USER', 'PERSONA', 'SYSTEM');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PersonaProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "ProfileStatus" NOT NULL DEFAULT 'ENROLLING',
    "minInteractions" INTEGER NOT NULL DEFAULT 50,
    "currentInteractions" INTEGER NOT NULL DEFAULT 0,
    "voiceConsentGiven" BOOLEAN NOT NULL DEFAULT false,
    "coverageMap" JSONB NOT NULL DEFAULT '{}',
    "consistencyScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PersonaProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EnrollmentQuestion" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "category" "CognitiveCategory" NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT,
    "askedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "answeredAt" TIMESTAMP(3),
    "turnNumber" INTEGER NOT NULL,

    CONSTRAINT "EnrollmentQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CognitiveMemory" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" "CognitiveCategory" NOT NULL,
    "embedding" TEXT,
    "importance" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "CognitiveMemory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatSession" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "messageCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ChatSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "role" "MessageRole" NOT NULL,
    "content" TEXT NOT NULL,
    "voiceUsed" BOOLEAN NOT NULL DEFAULT false,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VoiceSample" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "s3Key" TEXT NOT NULL,
    "durationSeconds" DOUBLE PRECISION NOT NULL,
    "consentPhrase" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VoiceSample_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AvatarConfig" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "baseImageKey" TEXT,
    "skin" TEXT NOT NULL DEFAULT 'default',
    "mood" TEXT NOT NULL DEFAULT 'neutral',
    "accessories" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AvatarConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PersonaTimeline" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "previousValue" TEXT,
    "newValue" TEXT NOT NULL,
    "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source" TEXT NOT NULL DEFAULT 'conversation',

    CONSTRAINT "PersonaTimeline_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "AvatarConfig_profileId_key" ON "AvatarConfig"("profileId");

-- AddForeignKey
ALTER TABLE "PersonaProfile" ADD CONSTRAINT "PersonaProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnrollmentQuestion" ADD CONSTRAINT "EnrollmentQuestion_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "PersonaProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CognitiveMemory" ADD CONSTRAINT "CognitiveMemory_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "PersonaProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatSession" ADD CONSTRAINT "ChatSession_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "PersonaProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatSession" ADD CONSTRAINT "ChatSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ChatSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoiceSample" ADD CONSTRAINT "VoiceSample_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "PersonaProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AvatarConfig" ADD CONSTRAINT "AvatarConfig_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "PersonaProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonaTimeline" ADD CONSTRAINT "PersonaTimeline_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "PersonaProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
