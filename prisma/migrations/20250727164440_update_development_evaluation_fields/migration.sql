/*
  Warnings:

  - You are about to drop the column `areas_para_apoyar` on the `development_evaluations` table. All the data in the column will be lost.
  - You are about to drop the column `atencion_y_aprendizaje` on the `development_evaluations` table. All the data in the column will be lost.
  - You are about to drop the column `autonomia_y_adaptacion` on the `development_evaluations` table. All the data in the column will be lost.
  - You are about to drop the column `comunicacion_y_lenguaje` on the `development_evaluations` table. All the data in the column will be lost.
  - You are about to drop the column `fortalezas` on the `development_evaluations` table. All the data in the column will be lost.
  - You are about to drop the column `habilidades_finas` on the `development_evaluations` table. All the data in the column will be lost.
  - You are about to drop the column `habilidades_gruesas` on the `development_evaluations` table. All the data in the column will be lost.
  - You are about to drop the column `recomendacion_casa` on the `development_evaluations` table. All the data in the column will be lost.
  - You are about to drop the column `recomendacion_colegio` on the `development_evaluations` table. All the data in the column will be lost.
  - You are about to drop the column `relacion_con_otros` on the `development_evaluations` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "development_evaluations" DROP COLUMN "areas_para_apoyar",
DROP COLUMN "atencion_y_aprendizaje",
DROP COLUMN "autonomia_y_adaptacion",
DROP COLUMN "comunicacion_y_lenguaje",
DROP COLUMN "fortalezas",
DROP COLUMN "habilidades_finas",
DROP COLUMN "habilidades_gruesas",
DROP COLUMN "recomendacion_casa",
DROP COLUMN "recomendacion_colegio",
DROP COLUMN "relacion_con_otros",
ADD COLUMN     "areas_to_support" TEXT,
ADD COLUMN     "attention_and_learning" "EvaluationLevel",
ADD COLUMN     "autonomy_and_adaptation" "EvaluationLevel",
ADD COLUMN     "communication_and_language" "EvaluationLevel",
ADD COLUMN     "fine_motor_skills" "EvaluationLevel",
ADD COLUMN     "gross_motor_skills" "EvaluationLevel",
ADD COLUMN     "home_recommendations" TEXT,
ADD COLUMN     "school_recommendations" TEXT,
ADD COLUMN     "social_relations" "EvaluationLevel",
ADD COLUMN     "strengths" TEXT;
