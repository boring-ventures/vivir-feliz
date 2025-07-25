-- CreateEnum
CREATE TYPE "DevelopmentArea" AS ENUM ('COMUNICACION_Y_LENGUAJE', 'HABILIDADES_MOTORAS_GRUESAS', 'HABILIDADES_MOTORAS_FINAS', 'ATENCION_Y_APRENDIZAJE', 'RELACION_CON_OTROS', 'AUTONOMIA_Y_ADAPTACION');

-- CreateEnum
CREATE TYPE "EvaluationLevel" AS ENUM ('NECESITA_APOYO', 'EN_DESARROLLO', 'SE_DESARROLLA_BIEN', 'CON_HABILIDADES_DESTACADAS');

-- CreateTable
CREATE TABLE "development_evaluations" (
    "id" TEXT NOT NULL,
    "appointment_id" TEXT NOT NULL,
    "comunicacion_y_lenguaje" "EvaluationLevel",
    "habilidades_gruesas" "EvaluationLevel",
    "habilidades_finas" "EvaluationLevel",
    "atencion_y_aprendizaje" "EvaluationLevel",
    "relacion_con_otros" "EvaluationLevel",
    "autonomia_y_adaptacion" "EvaluationLevel",
    "fortalezas" TEXT,
    "areas_para_apoyar" TEXT,
    "recomendacion_casa" TEXT,
    "recomendacion_colegio" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "development_evaluations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "development_evaluations_appointment_id_key" ON "development_evaluations"("appointment_id");

-- CreateIndex
CREATE INDEX "development_evaluations_appointment_id_idx" ON "development_evaluations"("appointment_id");

-- AddForeignKey
ALTER TABLE "development_evaluations" ADD CONSTRAINT "development_evaluations_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
