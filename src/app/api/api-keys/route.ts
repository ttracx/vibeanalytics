import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateApiKey } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name } = await request.json();

    const teamMember = await prisma.teamMember.findFirst({
      where: { userId: session.user.id },
      include: { team: true },
    });

    if (!teamMember?.team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    const apiKey = await prisma.apiKey.create({
      data: {
        name: name || "API Key",
        key: generateApiKey(),
        teamId: teamMember.team.id,
      },
    });

    return NextResponse.json({ apiKey });
  } catch (error) {
    console.error("API key creation error:", error);
    return NextResponse.json(
      { error: "Failed to create API key" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { keyId } = await request.json();

    const teamMember = await prisma.teamMember.findFirst({
      where: { userId: session.user.id },
      include: { team: { include: { apiKeys: true } } },
    });

    if (!teamMember?.team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    const keyBelongsToTeam = teamMember.team.apiKeys.some((k) => k.id === keyId);
    if (!keyBelongsToTeam) {
      return NextResponse.json({ error: "Key not found" }, { status: 404 });
    }

    await prisma.apiKey.delete({ where: { id: keyId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API key deletion error:", error);
    return NextResponse.json(
      { error: "Failed to delete API key" },
      { status: 500 }
    );
  }
}
