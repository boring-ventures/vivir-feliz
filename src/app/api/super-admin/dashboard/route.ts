import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { PaymentStatus } from "@prisma/client";

export async function GET() {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    );
    const startOfPreviousMonth = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1
    );
    const endOfPreviousMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      0,
      23,
      59,
      59,
      999
    );

    // Core counts reused from admin dashboard
    const [
      totalPatients,
      totalPatientsAllTime,
      monthlyAppointments,
      previousMonthAppointments,
      totalRevenueAgg,
      monthlyRevenueAgg,
      previousMonthRevenueAgg,
      todayAppointments,
      // Financial aggregates
      completedAllAgg,
      pendingAllAgg,
      overdueAllAgg,
      completedMonthlyAgg,
      pendingMonthlyAgg,
      // Payment method breakdown (overall and monthly)
      paymentsAllWithMethod,
      paymentsMonthlyWithMethod,
      // Top therapists by revenue (monthly)
      paymentsMonthlyWithRelations,
      // Outstanding by therapist (pending/overdue)
      pendingOrOverduePaymentsWithRelations,
      // Appointment quality (current month)
      monthlyAppointmentsByStatus,
      // Completed appointments all time (for averages)
      completedAppointmentsAllTime,
      // Therapist performance (current month)
      therapistAppointmentsGroupBy,
      therapistProfiles,
    ] = await Promise.all([
      prisma.patient.count({ where: { isActive: true } }),
      prisma.patient.count(),
      prisma.appointment.count({
        where: { date: { gte: startOfMonth, lte: endOfMonth } },
      }),
      prisma.appointment.count({
        where: { date: { gte: startOfPreviousMonth, lte: endOfPreviousMonth } },
      }),
      prisma.payment.aggregate({
        where: { status: PaymentStatus.COMPLETED },
        _sum: { amount: true },
      }),
      prisma.payment.aggregate({
        where: {
          status: PaymentStatus.COMPLETED,
          createdAt: { gte: startOfMonth, lte: endOfMonth },
        },
        _sum: { amount: true },
      }),
      prisma.payment.aggregate({
        where: {
          status: PaymentStatus.COMPLETED,
          createdAt: { gte: startOfPreviousMonth, lte: endOfPreviousMonth },
        },
        _sum: { amount: true },
      }),
      prisma.appointment.count({
        where: {
          date: {
            gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
            lt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1),
          },
        },
      }),
      prisma.payment.aggregate({
        where: { status: PaymentStatus.COMPLETED },
        _sum: { amount: true },
      }),
      prisma.payment.aggregate({
        where: { status: PaymentStatus.PENDING },
        _sum: { amount: true },
      }),
      prisma.payment.aggregate({
        where: { status: PaymentStatus.OVERDUE },
        _sum: { amount: true },
      }),
      prisma.payment.aggregate({
        where: {
          status: PaymentStatus.COMPLETED,
          createdAt: { gte: startOfMonth, lte: endOfMonth },
        },
        _sum: { amount: true },
      }),
      prisma.payment.aggregate({
        where: {
          status: PaymentStatus.PENDING,
          createdAt: { gte: startOfMonth, lte: endOfMonth },
        },
        _sum: { amount: true },
      }),
      prisma.payment.findMany({
        where: {},
        select: {
          paymentMethod: true,
          amount: true,
          status: true,
          createdAt: true,
        },
      }),
      prisma.payment.findMany({
        where: { createdAt: { gte: startOfMonth, lte: endOfMonth } },
        select: {
          paymentMethod: true,
          amount: true,
          status: true,
          createdAt: true,
        },
      }),
      prisma.payment.findMany({
        where: {
          status: PaymentStatus.COMPLETED,
          createdAt: { gte: startOfMonth, lte: endOfMonth },
        },
        include: {
          appointment: {
            select: {
              therapistId: true,
              therapist: { select: { firstName: true, lastName: true } },
            },
          },
          proposal: {
            select: {
              therapistId: true,
              therapist: { select: { firstName: true, lastName: true } },
            },
          },
        },
      }),
      prisma.payment.findMany({
        where: {
          status: { in: [PaymentStatus.PENDING, PaymentStatus.OVERDUE] },
        },
        include: {
          proposal: {
            select: {
              therapistId: true,
              therapist: { select: { firstName: true, lastName: true } },
            },
          },
        },
      }),
      prisma.appointment.groupBy({
        by: ["status"],
        where: { date: { gte: startOfMonth, lte: endOfMonth } },
        _count: { _all: true },
      }),
      prisma.appointment.count({ where: { status: "COMPLETED" } }),
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

    const toNumber = (d: unknown) => (d ? Number(d) : 0);
    const totalRevenue = toNumber(
      (totalRevenueAgg as { _sum?: { amount?: unknown } })?._sum?.amount
    );
    const monthlyRevenue = toNumber(
      (monthlyRevenueAgg as { _sum?: { amount?: unknown } })?._sum?.amount
    );
    const previousMonthlyRevenue = toNumber(
      (previousMonthRevenueAgg as { _sum?: { amount?: unknown } })?._sum?.amount
    );

    const revenueGrowth =
      previousMonthlyRevenue > 0
        ? ((monthlyRevenue - previousMonthlyRevenue) / previousMonthlyRevenue) *
          100
        : 0;

    const completedAll = toNumber(
      (completedAllAgg as { _sum?: { amount?: unknown } })?._sum?.amount
    );
    const pendingAll = toNumber(
      (pendingAllAgg as { _sum?: { amount?: unknown } })?._sum?.amount
    );
    const overdueAll = toNumber(
      (overdueAllAgg as { _sum?: { amount?: unknown } })?._sum?.amount
    );
    const completedMonthly = toNumber(
      (completedMonthlyAgg as { _sum?: { amount?: unknown } })?._sum?.amount
    );
    const pendingMonthly = toNumber(
      (pendingMonthlyAgg as { _sum?: { amount?: unknown } })?._sum?.amount
    );

    const collectionRate =
      completedAll + pendingAll > 0
        ? (completedAll / (completedAll + pendingAll)) * 100
        : 0;

    // Payment method breakdowns
    const byMethod: Record<string, number> = {};
    for (const p of paymentsAllWithMethod) {
      const isCompleted = p.status === PaymentStatus.COMPLETED;
      if (!isCompleted) continue;
      const method = p.paymentMethod || "UNKNOWN";
      byMethod[method] = (byMethod[method] || 0) + Number(p.amount);
    }
    const byMethodMonthly: Record<string, number> = {};
    for (const p of paymentsMonthlyWithMethod) {
      const isCompleted = p.status === PaymentStatus.COMPLETED;
      if (!isCompleted) continue;
      const method = p.paymentMethod || "UNKNOWN";
      byMethodMonthly[method] =
        (byMethodMonthly[method] || 0) + Number(p.amount);
    }

    // Top therapists by completed revenue this month
    const therapistRevenueMap: Record<
      string,
      { therapistId: string; therapistName: string; amount: number }
    > = {};
    for (const pay of paymentsMonthlyWithRelations) {
      let therapistId: string | null = null;
      let therapistName = "";
      if (pay.appointment?.therapistId) {
        therapistId = pay.appointment.therapistId;
        const t = pay.appointment.therapist;
        therapistName = `${t?.firstName ?? ""} ${t?.lastName ?? ""}`.trim();
      } else {
        const proposalRel = (
          pay as unknown as {
            proposal?: {
              therapistId?: string | null;
              therapist?: {
                firstName: string | null;
                lastName: string | null;
              } | null;
            } | null;
          }
        ).proposal;
        if (proposalRel?.therapistId) {
          therapistId = proposalRel.therapistId;
          const t = proposalRel.therapist;
          therapistName = `${t?.firstName ?? ""} ${t?.lastName ?? ""}`.trim();
        }
      }
      if (!therapistId) continue;
      const key = therapistId;
      if (!therapistRevenueMap[key]) {
        therapistRevenueMap[key] = {
          therapistId: key,
          therapistName: therapistName || key,
          amount: 0,
        };
      }
      therapistRevenueMap[key].amount += Number(pay.amount);
    }
    const topTherapistsMonthly = Object.values(therapistRevenueMap)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    // Appointment growth
    const appointmentGrowth =
      previousMonthAppointments > 0
        ? ((monthlyAppointments - previousMonthAppointments) /
            previousMonthAppointments) *
          100
        : 0;

    // Revenue trend (last 6 months)
    const monthKey = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const revenueTrend: Array<{ month: string; amount: number }> = [];
    for (let i = 5; i >= 0; i -= 1) {
      const from = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const to = new Date(
        now.getFullYear(),
        now.getMonth() - i + 1,
        0,
        23,
        59,
        59,
        999
      );
      const agg = await prisma.payment.aggregate({
        where: {
          status: PaymentStatus.COMPLETED,
          createdAt: { gte: from, lte: to },
        },
        _sum: { amount: true },
      });
      revenueTrend.push({
        month: monthKey(from),
        amount: toNumber(
          (agg as { _sum?: { amount?: unknown } })?._sum?.amount
        ),
      });
    }

    // AR aging buckets for pending/overdue
    const agingBuckets = {
      b0_30: 0,
      b31_60: 0,
      b61_90: 0,
      b91_plus: 0,
    } as Record<string, number>;
    for (const p of paymentsAllWithMethod) {
      if (
        p.status !== PaymentStatus.PENDING &&
        p.status !== PaymentStatus.OVERDUE
      )
        continue;
      const days = Math.floor(
        (now.getTime() - new Date(p.createdAt).getTime()) /
          (1000 * 60 * 60 * 24)
      );
      const amount = Number(p.amount);
      if (days <= 30) agingBuckets.b0_30 += amount;
      else if (days <= 60) agingBuckets.b31_60 += amount;
      else if (days <= 90) agingBuckets.b61_90 += amount;
      else agingBuckets.b91_plus += amount;
    }

    // Appointment quality (current month)
    let cmpl = 0;
    let canc = 0;
    let noshow = 0;
    let totalMon = 0;
    for (const r of monthlyAppointmentsByStatus) {
      const count = Number((r._count as { _all: number })._all ?? 0);
      totalMon += count;
      switch (r.status) {
        case "COMPLETED":
          cmpl += count;
          break;
        case "CANCELLED":
          canc += count;
          break;
        case "NO_SHOW":
          noshow += count;
          break;
        default:
          break;
      }
    }
    const noShowRate = totalMon > 0 ? (noshow / totalMon) * 100 : 0;
    const cancellationRate = totalMon > 0 ? (canc / totalMon) * 100 : 0;

    // Averages
    const avgRevenuePerPatient =
      totalPatientsAllTime > 0 ? totalRevenue / totalPatientsAllTime : 0;
    const avgRevenuePerAppointment =
      completedAppointmentsAllTime > 0
        ? totalRevenue / completedAppointmentsAllTime
        : 0;

    // Outstanding by therapist (pending/overdue)
    const outstandingByTherapistMap: Record<
      string,
      { therapistId: string; therapistName: string; amount: number }
    > = {};
    for (const p of pendingOrOverduePaymentsWithRelations) {
      const proposalRel = (
        p as unknown as {
          proposal?: {
            therapistId?: string | undefined | null;
            therapist?: {
              firstName: string | null;
              lastName: string | null;
            } | null;
          } | null;
        }
      ).proposal;
      const tId = (proposalRel?.therapistId ?? undefined) as string | undefined;
      const t = proposalRel?.therapist;
      if (!tId) continue;
      const name = `${t?.firstName ?? ""} ${t?.lastName ?? ""}`.trim() || tId;
      if (!outstandingByTherapistMap[tId]) {
        outstandingByTherapistMap[tId] = {
          therapistId: tId,
          therapistName: name,
          amount: 0,
        };
      }
      outstandingByTherapistMap[tId].amount += Number(p.amount);
    }
    const outstandingByTherapist = Object.values(outstandingByTherapistMap)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    // Therapist performance (current month)
    const therapistIdToName: Record<string, string> = {};
    for (const t of therapistProfiles) {
      therapistIdToName[t.id] =
        `${t.firstName ?? ""} ${t.lastName ?? ""}`.trim() || t.id;
    }
    const perfMap: Record<
      string,
      {
        therapistId: string;
        therapistName: string;
        scheduled: number;
        completed: number;
        cancelled: number;
        noShow: number;
        completionRate: number;
        revenue: number;
      }
    > = {};
    for (const row of therapistAppointmentsGroupBy) {
      const key = (row.therapistId as string) || "unknown";
      if (!perfMap[key]) {
        perfMap[key] = {
          therapistId: key,
          therapistName: therapistIdToName[key] || key,
          scheduled: 0,
          completed: 0,
          cancelled: 0,
          noShow: 0,
          completionRate: 0,
          revenue: 0,
        };
      }
      const c = Number((row._count as { _all: number })._all ?? 0);
      if (row.status === "COMPLETED") perfMap[key].completed += c;
      else if (
        ["SCHEDULED", "CONFIRMED", "IN_PROGRESS"].includes(row.status as string)
      )
        perfMap[key].scheduled += c;
      else if (row.status === "CANCELLED") perfMap[key].cancelled += c;
      else if (row.status === "NO_SHOW") perfMap[key].noShow += c;
    }
    for (const k of Object.keys(perfMap)) {
      const s = perfMap[k];
      const denom = s.scheduled + s.completed;
      s.completionRate = denom > 0 ? (s.completed / denom) * 100 : 0;
      const revenue =
        (therapistRevenueMap[k]?.amount as number | undefined) ?? 0;
      s.revenue = Number(revenue);
    }
    const monthlyTherapistPerformance = Object.values(perfMap).sort(
      (a, b) => b.completed - a.completed
    );

    return NextResponse.json({
      kpis: {
        totalPatients,
        monthlyAppointments,
        monthlyRevenue,
        totalRevenue,
        appointmentGrowth,
        revenueGrowth,
        // approximate placeholder until we add historical patient data
        patientGrowth: 12,
      },
      financial: {
        totalPaid: completedAll,
        pending: pendingAll,
        overdue: overdueAll,
        collectionRate,
        monthly: {
          paid: completedMonthly,
          pending: pendingMonthly,
        },
        byMethod: {
          total: byMethod,
          monthly: byMethodMonthly,
        },
        topTherapistsMonthly,
        revenueTrend,
        arAging: agingBuckets,
        appointmentQuality: {
          completed: cmpl,
          cancelled: canc,
          noShow: noshow,
          noShowRate,
          cancellationRate,
        },
        averages: {
          revenuePerPatient: avgRevenuePerPatient,
          revenuePerAppointment: avgRevenuePerAppointment,
        },
        outstandingByTherapist,
        monthlyTherapistPerformance,
      },
      today: {
        appointments: todayAppointments,
      },
    });
  } catch (error) {
    console.error("Error fetching super-admin dashboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
