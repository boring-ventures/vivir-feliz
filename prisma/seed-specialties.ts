import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const originalSpecialties = [
  {
    specialtyId: "SPEECH_THERAPIST",
    name: "Fonoaudiólogo",
    description: "Especialista en terapia del habla y lenguaje",
  },
  {
    specialtyId: "OCCUPATIONAL_THERAPIST",
    name: "Terapeuta Ocupacional",
    description: "Especialista en terapia ocupacional",
  },
  {
    specialtyId: "PSYCHOPEDAGOGUE",
    name: "Psicopedagogo",
    description: "Especialista en psicopedagogía",
  },
  {
    specialtyId: "ASD_THERAPIST",
    name: "Terapeuta TEA",
    description: "Especialista en terapia para Trastorno del Espectro Autista",
  },
  {
    specialtyId: "NEUROPSYCHOLOGIST",
    name: "Neuropsicólogo",
    description: "Especialista en neuropsicología",
  },
  {
    specialtyId: "COORDINATOR",
    name: "Coordinador",
    description: "Coordinador de tratamiento",
  },
  {
    specialtyId: "PSYCHOMOTRICIAN",
    name: "Psicomotricista",
    description: "Especialista en psicomotricidad",
  },
  {
    specialtyId: "PEDIATRIC_KINESIOLOGIST",
    name: "Kinesiólogo Pediátrico",
    description: "Especialista en kinesiología pediátrica",
  },
  {
    specialtyId: "PSYCHOLOGIST",
    name: "Psicólogo",
    description: "Especialista en psicología",
  },
  {
    specialtyId: "COORDINATION_ASSISTANT",
    name: "Asistente de Coordinación",
    description: "Asistente para la coordinación de tratamientos",
  },
  {
    specialtyId: "BEHAVIORAL_THERAPIST",
    name: "Terapeuta Conductual",
    description: "Especialista en terapia conductual",
  },
];

async function main() {
  console.log("🌱 Seeding specialties...");

  for (const specialty of originalSpecialties) {
    const existingSpecialty = await prisma.specialty.findUnique({
      where: { specialtyId: specialty.specialtyId },
    });

    if (!existingSpecialty) {
      await prisma.specialty.create({
        data: specialty,
      });
      console.log(
        `✅ Created specialty: ${specialty.name} (${specialty.specialtyId})`
      );
    } else {
      console.log(
        `⏭️  Specialty already exists: ${specialty.name} (${specialty.specialtyId})`
      );
    }
  }

  console.log("🎉 Seeding completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
