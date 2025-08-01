import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.log("Auth error:", authError);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("User authenticated:", user.id);

    // Get user profile
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
    });

    if (!profile || profile.role !== "THERAPIST") {
      console.log("Profile not found or not therapist:", {
        profile: profile?.role,
      });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is COORDINATOR
    if (profile.specialty !== "COORDINATOR") {
      console.log("User is not coordinator:", { specialty: profile.specialty });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("User authorized as coordinator, fetching reports...");

    // Fetch all therapeutic plans with therapist and patient info
    const therapeuticPlans = await prisma.therapeuticPlan.findMany({
      include: {
        therapist: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            specialty: true,
          },
        },
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    console.log("Therapeutic plans found:", therapeuticPlans.length);

    // Fetch all progress reports with therapist and patient info
    const progressReports = await prisma.progressReport.findMany({
      include: {
        therapist: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            specialty: true,
          },
        },
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    console.log("Progress reports found:", progressReports.length);

    const response = {
      therapeuticPlans,
      progressReports,
    };

    console.log("Sending response with data:", {
      therapeuticPlans: therapeuticPlans.length,
      progressReports: progressReports.length,
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
