import { NextResponse } from "next/server";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { AppointmentStatus } from "@prisma/client";

export async function GET() {
  try {
    const supabase = createServerComponentClient({ cookies });
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the parent profile
    const profile = await prisma.profile.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    if (!profile || profile.role !== "PARENT") {
      return NextResponse.json(
        { error: "Parent profile not found" },
        { status: 404 }
      );
    }

    // Get all patients belonging to this parent
    const patients = await prisma.patient.findMany({
      where: {
        parentId: profile.id,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        dateOfBirth: true,
      },
    });

    const patientIds = patients.map((patient) => patient.id);

    if (patientIds.length === 0) {
      return NextResponse.json({
        stats: {
          totalPatients: 0,
          upcomingAppointments: 0,
          completedAppointments: 0,
          totalDocuments: 0,
          totalPaid: 0,
          totalPending: 0,
        },
        nextAppointment: null,
        recentDocuments: [],
        recentActivity: [],
      });
    }

    // Get next appointment
    const nextAppointment = await prisma.appointment.findFirst({
      where: {
        patientId: { in: patientIds },
        status: {
          in: [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED],
        },
        date: {
          gte: new Date(),
        },
      },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            dateOfBirth: true,
          },
        },
        therapist: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            specialty: true,
          },
        },
        proposal: {
          select: {
            id: true,
            title: true,
            totalSessions: true,
          },
        },
      },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
    });

    // Get recent documents (last 5)
    const recentDocuments = await prisma.patientDocument.findMany({
      where: {
        patientId: { in: patientIds },
      },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        therapist: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { uploadedAt: "desc" },
      take: 5,
    });

    // Get recent appointments for activity feed
    const recentAppointments = await prisma.appointment.findMany({
      where: {
        patientId: { in: patientIds },
      },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        therapist: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
      take: 10,
    });

    // Get recent payments
    const recentPayments = await prisma.payment.findMany({
      where: {
        proposal: {
          patientId: { in: patientIds },
        },
      },
      include: {
        proposal: {
          include: {
            patient: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    // Calculate statistics
    const [
      upcomingAppointments,
      completedAppointments,
      totalDocuments,
      totalPaid,
      totalPending,
    ] = await Promise.all([
      prisma.appointment.count({
        where: {
          patientId: { in: patientIds },
          status: {
            in: [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED],
          },
          date: {
            gte: new Date(),
          },
        },
      }),
      prisma.appointment.count({
        where: {
          patientId: { in: patientIds },
          status: AppointmentStatus.COMPLETED,
        },
      }),
      prisma.patientDocument.count({
        where: {
          patientId: { in: patientIds },
        },
      }),
      prisma.payment.aggregate({
        where: {
          status: "COMPLETED",
          proposal: {
            patientId: { in: patientIds },
          },
        },
        _sum: {
          amount: true,
        },
      }),
      prisma.treatmentProposal.aggregate({
        where: {
          patientId: { in: patientIds },
        },
        _sum: {
          totalAmount: true,
        },
      }),
    ]);

    // Calculate total pending amount
    const totalPaidAmount = Number(totalPaid._sum.amount) || 0;
    const totalAmount = Number(totalPending._sum.totalAmount) || 0;
    const pendingAmount = Math.max(0, totalAmount - totalPaidAmount);

    // Transform next appointment
    const transformedNextAppointment = nextAppointment
      ? {
          id: nextAppointment.id,
          patientName: nextAppointment.patient
            ? `${nextAppointment.patient.firstName} ${nextAppointment.patient.lastName}`
            : nextAppointment.patientName || "Nombre no disponible",
          therapistName: nextAppointment.therapist
            ? `${nextAppointment.therapist.firstName} ${nextAppointment.therapist.lastName}`
            : "Terapeuta no asignado",
          appointmentDate: nextAppointment.date.toISOString(),
          appointmentTime: nextAppointment.startTime,
          endTime: nextAppointment.endTime,
          type: nextAppointment.type,
          status: nextAppointment.status,
          proposalTitle: nextAppointment.proposal?.title || "",
          totalSessions: nextAppointment.proposal?.totalSessions || 0,
        }
      : null;

    // Transform recent documents
    const transformedRecentDocuments = recentDocuments.map((document) => ({
      id: document.id,
      title: document.title,
      fileName: document.fileName,
      documentType: document.documentType,
      patientName: document.patient
        ? `${document.patient.firstName} ${document.patient.lastName}`
        : "Paciente no disponible",
      uploadedAt: document.uploadedAt.toISOString(),
    }));

    // Create activity feed
    const recentActivity = [
      ...recentAppointments.map((appointment) => ({
        type: "appointment",
        id: appointment.id,
        title: `Cita ${appointment.status === "COMPLETED" ? "completada" : "programada"}`,
        description: `${appointment.patient?.firstName} ${appointment.patient?.lastName} - ${appointment.therapist?.firstName} ${appointment.therapist?.lastName}`,
        date: appointment.updatedAt.toISOString(),
        status: appointment.status,
      })),
      ...recentPayments.map((payment) => ({
        type: "payment",
        id: payment.id,
        title: "Pago procesado",
        description: `Bs. ${payment.amount} - ${payment.proposal?.patient?.firstName || ""} ${payment.proposal?.patient?.lastName || ""}`,
        date: payment.createdAt.toISOString(),
        status: payment.status,
      })),
      ...recentDocuments.map((document) => ({
        type: "document",
        id: document.id,
        title: "Documento subido",
        description: `${document.title} - ${document.patient.firstName} ${document.patient.lastName}`,
        date: document.uploadedAt.toISOString(),
        documentType: document.documentType,
      })),
    ]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);

    return NextResponse.json({
      stats: {
        totalPatients: patients.length,
        upcomingAppointments,
        completedAppointments,
        totalDocuments,
        totalPaid: totalPaidAmount,
        totalPending: pendingAmount,
      },
      nextAppointment: transformedNextAppointment,
      recentDocuments: transformedRecentDocuments,
      recentActivity,
    });
  } catch (error) {
    console.error("Error fetching parent dashboard data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
