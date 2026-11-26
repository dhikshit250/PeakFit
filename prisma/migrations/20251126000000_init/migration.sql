-- CreateEnum
CREATE TYPE "UnitSystem" AS ENUM ('METRIC', 'IMPERIAL');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER', 'UNSPECIFIED');

-- CreateEnum
CREATE TYPE "FitnessGoalType" AS ENUM ('BULK', 'CUT', 'MAINTAIN');

-- CreateEnum
CREATE TYPE "WorkoutIntensity" AS ENUM ('LIGHT', 'MODERATE', 'INTENSE');

-- CreateEnum
CREATE TYPE "WorkoutSessionSource" AS ENUM ('MANUAL', 'AI_PLAN', 'IMPORTED');

-- CreateEnum
CREATE TYPE "CalorieEntryType" AS ENUM ('INTAKE', 'EXPENDITURE');

-- CreateEnum
CREATE TYPE "GoalMetricType" AS ENUM ('WEIGHT', 'BODY_FAT', 'STEPS', 'CALORIES', 'CUSTOM');

-- CreateEnum
CREATE TYPE "GoalStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'ABANDONED');

-- CreateEnum
CREATE TYPE "PersonalRecordType" AS ENUM ('MAX_WEIGHT', 'MAX_REPS', 'EST_1RM');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "clerkUserId" TEXT NOT NULL,
    "legacyUserId" INTEGER,
    "email" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "unitSystem" "UnitSystem" NOT NULL DEFAULT 'METRIC',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fullName" TEXT,
    "age" INTEGER,
    "gender" "Gender",
    "heightCm" DECIMAL(6,2),
    "weightKg" DECIMAL(6,2),
    "goal" "FitnessGoalType",
    "profileImageUrl" TEXT,
    "bio" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkoutPreferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "workoutDays" JSONB NOT NULL DEFAULT '[]',
    "restDays" JSONB NOT NULL DEFAULT '[]',
    "intensity" "WorkoutIntensity" NOT NULL DEFAULT 'MODERATE',
    "durationMinutes" INTEGER NOT NULL DEFAULT 45,
    "workoutType" TEXT NOT NULL DEFAULT 'Strength Training',
    "muscleGroups" JSONB NOT NULL DEFAULT '[]',
    "exercises" JSONB NOT NULL DEFAULT '[]',
    "calorieBurnGoal" INTEGER,
    "equipment" JSONB NOT NULL DEFAULT '[]',
    "remindersEnabled" BOOLEAN NOT NULL DEFAULT false,
    "progressiveOverload" BOOLEAN NOT NULL DEFAULT false,
    "warmUpCoolDown" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkoutPreferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DietPreferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dietType" TEXT NOT NULL DEFAULT 'Balanced',
    "carbPreference" TEXT NOT NULL DEFAULT 'Moderate-carb',
    "allergies" TEXT,
    "mealFrequency" TEXT NOT NULL DEFAULT '3 meals/day',
    "cheatMealsPerWeek" INTEGER,
    "calorieTarget" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DietPreferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkoutSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "endedAt" TIMESTAMP(3),
    "notes" TEXT,
    "source" "WorkoutSessionSource" NOT NULL DEFAULT 'MANUAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkoutSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExerciseLog" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "exerciseName" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExerciseLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SetLog" (
    "id" TEXT NOT NULL,
    "exerciseLogId" TEXT NOT NULL,
    "setNumber" INTEGER NOT NULL,
    "reps" INTEGER,
    "weightKg" DECIMAL(8,2),
    "durationSec" INTEGER,
    "rpe" DECIMAL(3,1),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SetLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PersonalRecord" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "exerciseName" TEXT NOT NULL,
    "recordType" "PersonalRecordType" NOT NULL,
    "value" DECIMAL(10,2) NOT NULL,
    "unit" TEXT NOT NULL,
    "achievedAt" TIMESTAMP(3) NOT NULL,
    "setLogId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PersonalRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PersonalRecordHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "exerciseName" TEXT NOT NULL,
    "recordType" "PersonalRecordType" NOT NULL,
    "previousValue" DECIMAL(10,2),
    "newValue" DECIMAL(10,2) NOT NULL,
    "unit" TEXT NOT NULL,
    "achievedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PersonalRecordHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeightEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL,
    "weightKg" DECIMAL(6,2) NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeightEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BodyFatEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL,
    "bodyFatPercent" DECIMAL(5,2) NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BodyFatEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BodyMeasurement" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL,
    "chestCm" DECIMAL(6,2),
    "waistCm" DECIMAL(6,2),
    "armCm" DECIMAL(6,2),
    "thighCm" DECIMAL(6,2),
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BodyMeasurement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CalorieEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL,
    "type" "CalorieEntryType" NOT NULL,
    "calories" INTEGER NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CalorieEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityDay" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "steps" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ActivityDay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WaterEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL,
    "amountMl" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WaterEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SleepEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "quality" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SleepEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgressPhoto" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "takenAt" TIMESTAMP(3) NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "caption" TEXT,
    "cloudinaryPublicId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProgressPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FitnessGoal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "metricType" "GoalMetricType" NOT NULL,
    "targetValue" DECIMAL(12,2) NOT NULL,
    "currentValue" DECIMAL(12,2),
    "unit" TEXT NOT NULL,
    "deadline" TIMESTAMP(3),
    "status" "GoalStatus" NOT NULL DEFAULT 'ACTIVE',
    "completedAt" TIMESTAMP(3),
    "title" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FitnessGoal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GeneratedPlan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "model" TEXT NOT NULL,
    "planJson" JSONB NOT NULL,
    "dayIndex" INTEGER NOT NULL DEFAULT 1,
    "planType" TEXT NOT NULL DEFAULT 'daily',

    CONSTRAINT "GeneratedPlan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkUserId_key" ON "User"("clerkUserId");

-- CreateIndex
CREATE UNIQUE INDEX "User_legacyUserId_key" ON "User"("legacyUserId");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_userId_key" ON "UserProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkoutPreferences_userId_key" ON "WorkoutPreferences"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DietPreferences_userId_key" ON "DietPreferences"("userId");

-- CreateIndex
CREATE INDEX "WorkoutSession_userId_startedAt_idx" ON "WorkoutSession"("userId", "startedAt" DESC);

-- CreateIndex
CREATE INDEX "ExerciseLog_sessionId_orderIndex_idx" ON "ExerciseLog"("sessionId", "orderIndex");

-- CreateIndex
CREATE UNIQUE INDEX "SetLog_exerciseLogId_setNumber_key" ON "SetLog"("exerciseLogId", "setNumber");

-- CreateIndex
CREATE INDEX "PersonalRecord_userId_achievedAt_idx" ON "PersonalRecord"("userId", "achievedAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "PersonalRecord_userId_exerciseName_recordType_key" ON "PersonalRecord"("userId", "exerciseName", "recordType");

-- CreateIndex
CREATE INDEX "PersonalRecordHistory_userId_exerciseName_achievedAt_idx" ON "PersonalRecordHistory"("userId", "exerciseName", "achievedAt" DESC);

-- CreateIndex
CREATE INDEX "WeightEntry_userId_recordedAt_idx" ON "WeightEntry"("userId", "recordedAt" DESC);

-- CreateIndex
CREATE INDEX "BodyFatEntry_userId_recordedAt_idx" ON "BodyFatEntry"("userId", "recordedAt" DESC);

-- CreateIndex
CREATE INDEX "BodyMeasurement_userId_recordedAt_idx" ON "BodyMeasurement"("userId", "recordedAt" DESC);

-- CreateIndex
CREATE INDEX "CalorieEntry_userId_recordedAt_idx" ON "CalorieEntry"("userId", "recordedAt" DESC);

-- CreateIndex
CREATE INDEX "ActivityDay_userId_date_idx" ON "ActivityDay"("userId", "date" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "ActivityDay_userId_date_key" ON "ActivityDay"("userId", "date");

-- CreateIndex
CREATE INDEX "WaterEntry_userId_recordedAt_idx" ON "WaterEntry"("userId", "recordedAt" DESC);

-- CreateIndex
CREATE INDEX "SleepEntry_userId_recordedAt_idx" ON "SleepEntry"("userId", "recordedAt" DESC);

-- CreateIndex
CREATE INDEX "ProgressPhoto_userId_takenAt_idx" ON "ProgressPhoto"("userId", "takenAt" DESC);

-- CreateIndex
CREATE INDEX "FitnessGoal_userId_status_idx" ON "FitnessGoal"("userId", "status");

-- CreateIndex
CREATE INDEX "GeneratedPlan_userId_generatedAt_idx" ON "GeneratedPlan"("userId", "generatedAt" DESC);

-- AddForeignKey
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutPreferences" ADD CONSTRAINT "WorkoutPreferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DietPreferences" ADD CONSTRAINT "DietPreferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutSession" ADD CONSTRAINT "WorkoutSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseLog" ADD CONSTRAINT "ExerciseLog_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "WorkoutSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SetLog" ADD CONSTRAINT "SetLog_exerciseLogId_fkey" FOREIGN KEY ("exerciseLogId") REFERENCES "ExerciseLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonalRecord" ADD CONSTRAINT "PersonalRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonalRecordHistory" ADD CONSTRAINT "PersonalRecordHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeightEntry" ADD CONSTRAINT "WeightEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BodyFatEntry" ADD CONSTRAINT "BodyFatEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BodyMeasurement" ADD CONSTRAINT "BodyMeasurement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalorieEntry" ADD CONSTRAINT "CalorieEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityDay" ADD CONSTRAINT "ActivityDay_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WaterEntry" ADD CONSTRAINT "WaterEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SleepEntry" ADD CONSTRAINT "SleepEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgressPhoto" ADD CONSTRAINT "ProgressPhoto_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FitnessGoal" ADD CONSTRAINT "FitnessGoal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneratedPlan" ADD CONSTRAINT "GeneratedPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
