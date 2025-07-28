import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { PaymentStatus } from "@prisma/client";

export async function GET(request: NextRequest) {
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

    // Fetch all the dashboard data in parallel
    const [
      totalPatients,
      activePatients,
      totalAppointments,
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
      todayAppointments,
      pendingPayments,
      completedPayments,
      patientsInEvaluation,
      completedPatients,
      recentActivity,
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

      // Total appointments
      prisma.appointment.count(),

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
      },
      patients: {
        active: activePatients,
        inEvaluation: patientsInEvaluation,
        completed: completedPatients,
      },
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
