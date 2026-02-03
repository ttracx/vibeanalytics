import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const teamMember = await prisma.teamMember.findFirst({
      where: { userId: session.user.id },
      include: {
        team: {
          include: {
            apiKeys: {
              select: {
                id: true,
                name: true,
                key: true,
                lastUsed: true,
              },
            },
          },
        },
      },
    });

    if (!teamMember?.team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    return NextResponse.json({
      name: teamMember.team.name,
      plan: teamMember.team.plan,
      stripeCurrentPeriodEnd: teamMember.team.stripeCurrentPeriodEnd,
      apiKeys: teamMember.team.apiKeys,
    });
  } catch (error) {
    console.error("Team fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch team" },
      { status: 500 }
    );
  }
}
