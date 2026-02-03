import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const projectId = searchParams.get("projectId");
    const format = searchParams.get("format") || "json";
    const days = parseInt(searchParams.get("days") || "30");

    if (!projectId) {
      return NextResponse.json(
        { error: "projectId is required" },
        { status: 400 }
      );
    }

    // Verify user has access to project
    const teamMember = await prisma.teamMember.findFirst({
      where: { userId: session.user.id },
      include: {
        team: {
          include: {
            projects: { where: { id: projectId } },
          },
        },
      },
    });

    if (!teamMember?.team?.projects?.length) {
      return NextResponse.json(
        { error: "Project not found or unauthorized" },
        { status: 404 }
      );
    }

    // Check if user has pro plan for export
    if (teamMember.team.plan !== "pro") {
      return NextResponse.json(
        { error: "Data export requires Pro plan" },
        { status: 403 }
      );
    }

    // Get events
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const events = await prisma.event.findMany({
      where: {
        projectId,
        timestamp: { gte: since },
      },
      orderBy: { timestamp: "desc" },
      take: 100000, // Limit to 100k events
    });

    if (format === "csv") {
      // Convert to CSV
      const headers = [
        "id",
        "name",
        "timestamp",
        "sessionId",
        "userId",
        "url",
        "referrer",
        "device",
        "browser",
        "os",
        "country",
        "city",
        "properties",
      ];

      const csvRows = [headers.join(",")];
      events.forEach((event) => {
        const row = [
          event.id,
          event.name,
          event.timestamp.toISOString(),
          event.sessionId,
          event.userId || "",
          event.url || "",
          event.referrer || "",
          event.device || "",
          event.browser || "",
          event.os || "",
          event.country || "",
          event.city || "",
          JSON.stringify(event.properties || {}),
        ];
        csvRows.push(row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","));
      });

      return new NextResponse(csvRows.join("\n"), {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="vibeanalytics-export-${projectId}.csv"`,
        },
      });
    }

    // JSON format
    return NextResponse.json({
      projectId,
      exportedAt: new Date().toISOString(),
      eventCount: events.length,
      events,
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: "Failed to export data" },
      { status: 500 }
    );
  }
}
