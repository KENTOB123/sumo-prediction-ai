/*
  Warnings:

  - You are about to drop the column `birthDate` on the `rikishi` table. All the data in the column will be lost.
  - You are about to drop the column `debutDate` on the `rikishi` table. All the data in the column will be lost.
  - You are about to drop the column `height` on the `rikishi` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `rikishi` table. All the data in the column will be lost.
  - You are about to drop the column `weight` on the `rikishi` table. All the data in the column will be lost.
  - Added the required column `age` to the `rikishi` table without a default value. This is not possible if the table is not empty.
  - Added the required column `career_record` to the `rikishi` table without a default value. This is not possible if the table is not empty.
  - Added the required column `current_streak` to the `rikishi` table without a default value. This is not possible if the table is not empty.
  - Added the required column `height_cm` to the `rikishi` table without a default value. This is not possible if the table is not empty.
  - Added the required column `last_3_basho` to the `rikishi` table without a default value. This is not possible if the table is not empty.
  - Added the required column `preferred_kimarite` to the `rikishi` table without a default value. This is not possible if the table is not empty.
  - Added the required column `special_prizes` to the `rikishi` table without a default value. This is not possible if the table is not empty.
  - Added the required column `weight_kg` to the `rikishi` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "rikishi_name_key";

-- AlterTable
ALTER TABLE "predictions" ADD COLUMN     "confidenceFactors" JSONB,
ADD COLUMN     "matchDuration" INTEGER,
ADD COLUMN     "predictedTechnique" TEXT;

-- AlterTable
ALTER TABLE "rikishi" DROP COLUMN "birthDate",
DROP COLUMN "debutDate",
DROP COLUMN "height",
DROP COLUMN "name",
DROP COLUMN "weight",
ADD COLUMN     "age" INTEGER NOT NULL,
ADD COLUMN     "career_record" JSONB NOT NULL,
ADD COLUMN     "current_streak" JSONB NOT NULL,
ADD COLUMN     "elo" INTEGER NOT NULL DEFAULT 1500,
ADD COLUMN     "head2head_vs_next" JSONB,
ADD COLUMN     "height_cm" INTEGER NOT NULL,
ADD COLUMN     "injury_status" TEXT NOT NULL DEFAULT 'healthy',
ADD COLUMN     "kinboshi" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "last_3_basho" JSONB NOT NULL,
ADD COLUMN     "preferred_kimarite" JSONB NOT NULL,
ADD COLUMN     "special_prizes" JSONB NOT NULL,
ADD COLUMN     "weight_kg" INTEGER NOT NULL,
ADD COLUMN     "yusho" INTEGER NOT NULL DEFAULT 0;
