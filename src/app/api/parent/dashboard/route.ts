import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { AppointmentStatus } from "@prisma/client";

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
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

    console.log("Parent dashboard - User ID:", session.user.id);
    console.log("Parent dashboard - Profile found:", !!profile);
    console.log("Parent dashboard - Profile role:", profile?.role);

    if (!profile || profile.role !== "PARENT") {
      console.log("Parent dashboard - Profile not found or not a parent");
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

    console.log("Parent dashboard - Found patients:", patients.length);
    console.log("Parent dashboard - Patient IDs:", patientIds);

    if (patientIds.length === 0) {
      console.log("Parent dashboard - No patients found, returning empty data");
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
      treatmentProposals,
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
          status: { in: ["COMPLETED", "PARTIAL"] },
          proposal: {
            patientId: { in: patientIds },
          },
        },
        _sum: {
          amount: true,
        },
      }),
      prisma.treatmentProposal.findMany({
        where: {
          patientId: { in: patientIds },
        },
        select: {
          sessionPrice: true,
          totalSessions: true,
          selectedProposal: true,
        },
      }),
    ]);

    // Calculate total pending amount
    const totalPaidAmount = Number(totalPaid._sum.amount) || 0;

    // Calculate total amount from treatment proposals
    const totalAmount = treatmentProposals.reduce((sum, proposal) => {
      const sessionPrice = Number(proposal.sessionPrice) || 0;
      let totalSessions = 0;

      if (
        proposal.totalSessions &&
        typeof proposal.totalSessions === "object"
      ) {
        const totalSessionsObj = proposal.totalSessions as {
          A?: number;
          B?: number;
        };
        if (proposal.selectedProposal === "A") {
          totalSessions = totalSessionsObj.A || 0;
        } else if (proposal.selectedProposal === "B") {
          totalSessions = totalSessionsObj.B || 0;
        } else {
          // If no proposal selected, use the higher value
          totalSessions = Math.max(
            totalSessionsObj.A || 0,
            totalSessionsObj.B || 0
          );
        }
      }

      return sum + sessionPrice * totalSessions;
    }, 0);

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
          totalSessions: (() => {
            const totalSessions = nextAppointment.proposal?.totalSessions;
            if (totalSessions && typeof totalSessions === "object") {
              const totalSessionsObj = totalSessions as {
                A?: number;
                B?: number;
              };
              return Math.max(totalSessionsObj.A || 0, totalSessionsObj.B || 0);
            } else if (typeof totalSessions === "number") {
              return totalSessions;
            }
            return 0;
          })(),
        }
      : null;

    // Transform recent documents
    const transformedRecentDocuments = recentDocuments.map((document) => ({
      id: document.id,
      title: document.title,
      fileName: document.fileName,
      fileUrl: document.fileUrl,
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

    const response = {
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
    };

    console.log("Parent dashboard - Response stats:", response.stats);
    console.log(
      "Parent dashboard - Next appointment:",
      response.nextAppointment ? "Found" : "None"
    );
    console.log(
      "Parent dashboard - Recent documents:",
      response.recentDocuments.length
    );
    console.log(
      "Parent dashboard - Recent activity:",
      response.recentActivity.length
    );

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching parent dashboard data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
