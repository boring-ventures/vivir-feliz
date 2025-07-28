/*
  Warnings:

  - The values [NECESITA_APOYO,EN_DESARROLLO,SE_DESARROLLA_BIEN,CON_HABILIDADES_DESTACADAS] on the enum `EvaluationLevel` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "EvaluationLevel_new" AS ENUM ('NEEDS_SUPPORT', 'IN_DEVELOPMENT', 'DEVELOPING_WELL', 'WITH_OUTSTANDING_SKILLS');
ALTER TABLE "development_evaluations" ALTER COLUMN "comunicacion_y_lenguaje" TYPE "EvaluationLevel_new" USING ("comunicacion_y_lenguaje"::text::"EvaluationLevel_new");
ALTER TABLE "development_evaluations" ALTER COLUMN "habilidades_gruesas" TYPE "EvaluationLevel_new" USING ("habilidades_gruesas"::text::"EvaluationLevel_new");
ALTER TABLE "development_evaluations" ALTER COLUMN "habilidades_finas" TYPE "EvaluationLevel_new" USING ("habilidades_finas"::text::"EvaluationLevel_new");
ALTER TABLE "development_evaluations" ALTER COLUMN "atencion_y_aprendizaje" TYPE "EvaluationLevel_new" USING ("atencion_y_aprendizaje"::text::"EvaluationLevel_new");
ALTER TABLE "development_evaluations" ALTER COLUMN "relacion_con_otros" TYPE "EvaluationLevel_new" USING ("relacion_con_otros"::text::"EvaluationLevel_new");
ALTER TABLE "development_evaluations" ALTER COLUMN "autonomia_y_adaptacion" TYPE "EvaluationLevel_new" USING ("autonomia_y_adaptacion"::text::"EvaluationLevel_new");
ALTER TYPE "EvaluationLevel" RENAME TO "EvaluationLevel_old";
ALTER TYPE "EvaluationLevel_new" RENAME TO "EvaluationLevel";
DROP TYPE "EvaluationLevel_old";
COMMIT;

-- DropEnum
DROP TYPE "DevelopmentArea";
