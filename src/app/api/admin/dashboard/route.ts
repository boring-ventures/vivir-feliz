import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { PaymentStatus } from "@prisma/client";

export async function GET() {
  try {
    // Simple auth check - in a real app you'd use proper NextAuth
    // For now, we'll assume the request is authorized
    // TODO: Implement proper authentication

    // Get current date and month boundaries
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const startOfPreviousMonth = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1
    );
    const endOfPreviousMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);

    // Fetch all the dashboard data in parallel
    const [
      totalPatients,
      activePatients,
      monthlyAppointments,
      previousMonthAppointments,
      totalRevenue,
      monthlyRevenue,
      previousMonthRevenue,
      consultationRequests,
      pendingConsultationRequests,
      scheduledConsultationRequests,
      interviewRequests,
      pendingInterviewRequests,
      scheduledInterviewRequests,
      activeTherapists,
      totalTherapists,
      availableForConsultationsCount,
      activeTherapistsList,
      therapistsForAreaBreakdown,
      todayAppointments,
      pendingPayments,
      completedPayments,
      patientsInEvaluation,
      completedPatients,
      recentActivity,
      // Metrics additions
      monthlyNewPatients,
      totalPatientsAllTime,
      consultasMonthly,
      consultasYtd,
      developmentEvalMonthly,
      developmentEvalYtd,
      analysesMonthly,
      analysesYtd,
      proposalServicesMonthly,
      proposalServicesAll,
      therapeuticPlansNeuro,
      therapeuticPlansTemprana,
      // Active therapist-patient links for specialty aggregation
      activeTherapistPatients,
      prevMonthPatientIdsRaw,
      currMonthPatientIdsRaw,
      agendaGroupBy,
      agendaTherapistsProfiles,
    ] = await Promise.all([
      // Total patients
      prisma.patient.count({ where: { isActive: true } }),

      // Active patients (have appointments in last 30 days)
      prisma.patient.count({
        where: {
          isActive: true,
          appointments: {
            some: {
              date: {
                gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
              },
            },
          },
        },
      }),

      // Monthly appointments
      prisma.appointment.count({
        where: {
          date: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
      }),

      // Previous month appointments
      prisma.appointment.count({
        where: {
          date: {
            gte: startOfPreviousMonth,
            lte: endOfPreviousMonth,
          },
        },
      }),

      // Total revenue (from payments)
      prisma.payment.aggregate({
        where: { status: PaymentStatus.COMPLETED },
        _sum: { amount: true },
      }),

      // Monthly revenue
      prisma.payment.aggregate({
        where: {
          status: PaymentStatus.COMPLETED,
          createdAt: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
        _sum: { amount: true },
      }),

      // Previous month revenue
      prisma.payment.aggregate({
        where: {
          status: PaymentStatus.COMPLETED,
          createdAt: {
            gte: startOfPreviousMonth,
            lte: endOfPreviousMonth,
          },
        },
        _sum: { amount: true },
      }),

      // Total consultation requests
      prisma.consultationRequest.count(),

      // Pending consultation requests
      prisma.consultationRequest.count({
        where: { status: "PENDING" },
      }),

      // Scheduled consultation requests
      prisma.consultationRequest.count({
        where: { status: "SCHEDULED" },
      }),

      // Total interview requests
      prisma.interviewRequest.count(),

      // Pending interview requests
      prisma.interviewRequest.count({
        where: { status: "PENDING" },
      }),

      // Scheduled interview requests
      prisma.interviewRequest.count({
        where: { status: "SCHEDULED" },
      }),

      // Active therapists
      prisma.profile.count({
        where: {
          role: "THERAPIST",
          active: true,
        },
      }),

      // Total therapists
      prisma.profile.count({
        where: { role: "THERAPIST" },
      }),

      // Active therapists who can take consultations
      prisma.profile.count({
        where: {
          role: "THERAPIST",
          active: true,
          canTakeConsultations: true,
        },
      }),

      // Small list of active therapists with consultation availability
      prisma.profile.findMany({
        where: { role: "THERAPIST", active: true },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          canTakeConsultations: true,
        },
        orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
        take: 8,
      }),

      // Active therapists for per-area breakdown
      prisma.profile.findMany({
        where: { role: "THERAPIST", active: true },
        select: { specialty: true, canTakeConsultations: true },
      }),

      // Today's appointments
      prisma.appointment.count({
        where: {
          date: {
            gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
            lt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1),
          },
        },
      }),

      // Pending payments
      prisma.payment.aggregate({
        where: { status: PaymentStatus.PENDING },
        _sum: { amount: true },
      }),

      // Completed payments
      prisma.payment.aggregate({
        where: { status: PaymentStatus.COMPLETED },
        _sum: { amount: true },
      }),

      // Patients in evaluation (have analysis but no therapeutic plan)
      prisma.patient.count({
        where: {
          isActive: true,
          therapeuticPlans: {
            none: {},
          },
        },
      }),

      // Completed patients (have therapeutic plan and progress reports)
      prisma.patient.count({
        where: {
          isActive: true,
          therapeuticPlans: {
            some: {},
          },
          progressReports: {
            some: {},
          },
        },
      }),

      // Recent activity (last 7 days)
      prisma.appointment.findMany({
        where: {
          createdAt: {
            gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
          },
        },
        include: {
          patient: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
          therapist: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),

      // Patients created in current month
      prisma.patient.count({
        where: {
          createdAt: { gte: startOfMonth, lte: endOfMonth },
        },
      }),
      // Total patients all-time
      prisma.patient.count(),

      // Consultas counts
      prisma.appointment.count({
        where: {
          type: "CONSULTA",
          date: { gte: startOfMonth, lte: endOfMonth },
        },
      }),
      prisma.appointment.count({
        where: { type: "CONSULTA", date: { gte: startOfYear, lte: endOfYear } },
      }),

      // Evaluations (DevelopmentEvaluation)
      prisma.developmentEvaluation.count({
        where: {
          appointment: { date: { gte: startOfMonth, lte: endOfMonth } },
        },
      }),
      prisma.developmentEvaluation.count({
        where: { appointment: { date: { gte: startOfYear, lte: endOfYear } } },
      }),
      // Analyses
      prisma.analysis.count({
        where: {
          appointment: { date: { gte: startOfMonth, lte: endOfMonth } },
        },
      }),
      prisma.analysis.count({
        where: { appointment: { date: { gte: startOfYear, lte: endOfYear } } },
      }),

      // Treatments by area (ProposalService with type TREATMENT)
      prisma.proposalService.findMany({
        where: {
          type: "TREATMENT",
          createdAt: { gte: startOfMonth, lte: endOfMonth },
        },
        include: { therapist: { select: { id: true, specialty: true } } },
      }),
      prisma.proposalService.findMany({
        where: { type: "TREATMENT" },
        include: { therapist: { select: { id: true, specialty: true } } },
      }),

      // Programs (Neuro / Atención Temprana) via TherapeuticPlan.treatmentArea keyword search
      prisma.therapeuticPlan.findMany({
        where: { treatmentArea: { contains: "neuro", mode: "insensitive" } },
        select: { patientId: true },
      }),
      prisma.therapeuticPlan.findMany({
        where: { treatmentArea: { contains: "temprana", mode: "insensitive" } },
        select: { patientId: true },
      }),

      // Active therapist-patient relationships
      prisma.therapistPatient.findMany({
        where: { active: true },
        include: { therapist: { select: { specialty: true } } },
      }),

      // Retention/Churn via distinct patientIds by month
      prisma.appointment.findMany({
        where: {
          date: { gte: startOfPreviousMonth, lte: endOfPreviousMonth },
          patientId: { not: null },
        },
        select: { patientId: true },
        distinct: ["patientId"],
      }),
      prisma.appointment.findMany({
        where: {
          date: { gte: startOfMonth, lte: endOfMonth },
          patientId: { not: null },
        },
        select: { patientId: true },
        distinct: ["patientId"],
      }),

      // Agenda consolidated by therapist for current month (group by therapistId and status)
      prisma.appointment.groupBy({
        by: ["therapistId", "status"],
        where: { date: { gte: startOfMonth, lte: endOfMonth } },
        _count: { _all: true },
      }),
      prisma.profile.findMany({
        where: { role: "THERAPIST" },
        select: { id: true, firstName: true, lastName: true },
      }),
    ]);

    // Convert Decimal values to numbers for calculations
    const totalRevenueAmount = totalRevenue._sum.amount
      ? Number(totalRevenue._sum.amount)
      : 0;
    const monthlyRevenueAmount = monthlyRevenue._sum.amount
      ? Number(monthlyRevenue._sum.amount)
      : 0;
    const previousMonthRevenueAmount = previousMonthRevenue._sum.amount
      ? Number(previousMonthRevenue._sum.amount)
      : 0;
    const pendingPaymentsAmount = pendingPayments._sum.amount
      ? Number(pendingPayments._sum.amount)
      : 0;
    const completedPaymentsAmount = completedPayments._sum.amount
      ? Number(completedPayments._sum.amount)
      : 0;

    // Calculate percentages and trends
    const appointmentGrowth =
      previousMonthAppointments > 0
        ? ((monthlyAppointments - previousMonthAppointments) /
            previousMonthAppointments) *
          100
        : 0;

    const revenueGrowth =
      previousMonthRevenueAmount > 0
        ? ((monthlyRevenueAmount - previousMonthRevenueAmount) /
            previousMonthRevenueAmount) *
          100
        : 0;

    const patientGrowth = 12; // This would need historical data to calculate properly

    const satisfactionScore = 4.8; // This would need a rating system to calculate

    // Build metrics payloads
    const prevMonthPatientIds = new Set(
      (prevMonthPatientIdsRaw || [])
        .map((p) => p.patientId)
        .filter((id): id is string => !!id)
    );
    const currMonthPatientIds = new Set(
      (currMonthPatientIdsRaw || [])
        .map((p) => p.patientId)
        .filter((id): id is string => !!id)
    );

    const retainedCount = Array.from(prevMonthPatientIds).filter((id) =>
      currMonthPatientIds.has(id)
    ).length;
    const lostCount = Array.from(prevMonthPatientIds).filter(
      (id) => !currMonthPatientIds.has(id)
    ).length;
    const newCount = Array.from(currMonthPatientIds).filter(
      (id) => !prevMonthPatientIds.has(id)
    ).length;
    const denom = prevMonthPatientIds.size || 0;
    const retentionRate = denom > 0 ? (retainedCount / denom) * 100 : 0;
    const churnRate = denom > 0 ? (lostCount / denom) * 100 : 0;

    const monthlyBySpecialty: Record<string, number> = {};
    for (const s of proposalServicesMonthly) {
      const spec = s.therapist?.specialty || "UNKNOWN";
      monthlyBySpecialty[spec] = (monthlyBySpecialty[spec] || 0) + 1;
    }
    const totalBySpecialty: Record<string, number> = {};
    for (const s of proposalServicesAll) {
      const spec = s.therapist?.specialty || "UNKNOWN";
      totalBySpecialty[spec] = (totalBySpecialty[spec] || 0) + 1;
    }

    // Active treatments by area via TherapistPatient relationships
    const activeBySpecialty: Record<string, number> = {};
    for (const tp of activeTherapistPatients) {
      const spec = tp.therapist?.specialty || "UNKNOWN";
      activeBySpecialty[spec] = (activeBySpecialty[spec] || 0) + 1;
    }
    const activeTotal = activeTherapistPatients.length;

    const neuroPatients = new Set(
      therapeuticPlansNeuro.map((p) => p.patientId)
    );
    const atencionTempranaPatients = new Set(
      therapeuticPlansTemprana.map((p) => p.patientId)
    );

    const therapistIdToName: Record<string, string> = {};
    for (const t of agendaTherapistsProfiles) {
      therapistIdToName[t.id] =
        `${t.firstName ?? ""} ${t.lastName ?? ""}`.trim();
    }
    const agendaMap: Record<
      string,
      {
        therapistId: string;
        therapistName: string;
        scheduled: number;
        completed: number;
        cancelled: number;
        noShow: number;
      }
    > = {};
    for (const row of agendaGroupBy) {
      const key = row.therapistId as string;
      if (!agendaMap[key]) {
        agendaMap[key] = {
          therapistId: key,
          therapistName: therapistIdToName[key] || key,
          scheduled: 0,
          completed: 0,
          cancelled: 0,
          noShow: 0,
        };
      }
      const count = Number((row._count as { _all: number })._all ?? 0);
      switch (row.status) {
        case "SCHEDULED":
        case "CONFIRMED":
        case "IN_PROGRESS":
          agendaMap[key].scheduled += count;
          break;
        case "COMPLETED":
          agendaMap[key].completed += count;
          break;
        case "CANCELLED":
          agendaMap[key].cancelled += count;
          break;
        case "NO_SHOW":
          agendaMap[key].noShow += count;
          break;
        default:
          break;
      }
    }

    return NextResponse.json({
      kpis: {
        totalPatients,
        activePatients,
        monthlyAppointments,
        totalRevenue: totalRevenueAmount,
        monthlyRevenue: monthlyRevenueAmount,
        satisfactionScore,
        patientGrowth,
        appointmentGrowth,
        revenueGrowth,
      },
      metrics: {
        patients: {
          monthlyNew: monthlyNewPatients,
          total: totalPatientsAllTime,
        },
        retention: {
          retained: retainedCount,
          lost: lostCount,
          new: newCount,
          retentionRate,
          churnRate,
        },
        consultas: {
          monthly: consultasMonthly,
          ytd: consultasYtd,
        },
        evaluaciones: {
          monthly: {
            development: developmentEvalMonthly,
            analysis: analysesMonthly,
            total: developmentEvalMonthly + analysesMonthly,
          },
          ytd: {
            development: developmentEvalYtd,
            analysis: analysesYtd,
            total: developmentEvalYtd + analysesYtd,
          },
        },
        tratamientosPorArea: {
          monthlyBySpecialty,
          totalBySpecialty,
          monthlyTotal: proposalServicesMonthly.length,
          total: proposalServicesAll.length,
          activeBySpecialty,
          activeTotal,
        },
        programas: {
          neuro: neuroPatients.size,
          atencionTemprana: atencionTempranaPatients.size,
        },
        agendaPorTerapeuta: Object.values(agendaMap),
      },
      requests: {
        consultationRequests: {
          total: consultationRequests,
          pending: pendingConsultationRequests,
          scheduled: scheduledConsultationRequests,
        },
        interviewRequests: {
          total: interviewRequests,
          pending: pendingInterviewRequests,
          scheduled: scheduledInterviewRequests,
        },
      },
      staff: {
        activeTherapists,
        totalTherapists,
        availableForConsultations: availableForConsultationsCount,
        activeList: (activeTherapistsList || []).map((t) => ({
          id: t.id,
          name: `${t.firstName ?? ""} ${t.lastName ?? ""}`.trim(),
          canTakeConsultations: Boolean(t.canTakeConsultations),
        })),
        bySpecialty: (() => {
          const map: Record<string, { active: number; available: number }> = {};
          for (const t of therapistsForAreaBreakdown) {
            const key = (t.specialty as string) || "UNKNOWN";
            if (!map[key]) map[key] = { active: 0, available: 0 };
            map[key].active += 1;
            if (t.canTakeConsultations) map[key].available += 1;
          }
          return map;
        })(),
      },
      patients: {
        active: activePatients,
        inEvaluation: patientsInEvaluation,
        completed: completedPatients,
      },
      // financial removed from UI but kept here if needed elsewhere
      financial: {
        totalPaid: completedPaymentsAmount,
        pending: pendingPaymentsAmount,
        collectionRate:
          completedPaymentsAmount + pendingPaymentsAmount > 0
            ? (completedPaymentsAmount /
                (completedPaymentsAmount + pendingPaymentsAmount)) *
              100
            : 0,
      },
      today: {
        appointments: todayAppointments,
      },
      recentActivity,
    });
  } catch (error) {
    console.error("Error fetching admin dashboard data:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
