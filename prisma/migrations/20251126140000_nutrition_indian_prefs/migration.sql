-- AlterTable
ALTER TABLE "DietPreferences" ADD COLUMN "preferIndianCuisine" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "CalorieEntry" ADD COLUMN "proteinG" INTEGER,
ADD COLUMN "carbsG" INTEGER,
ADD COLUMN "fatG" INTEGER;