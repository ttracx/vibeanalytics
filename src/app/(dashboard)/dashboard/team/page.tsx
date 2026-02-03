import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, UserPlus, Crown, User } from "lucide-react";
import Link from "next/link";

export default async function TeamPage() {
  const session = await auth();
  if (!session?.user) return null;

  const teamMember = await prisma.teamMember.findFirst({
    where: { userId: session.user.id },
    include: {
      team: {
        include: {
          members: {
            include: {
              user: {
                select: { id: true, name: true, email: true, image: true },
              },
            },
            orderBy: { createdAt: "asc" },
          },
        },
      },
    },
  });

  const team = teamMember?.team;
  const members = team?.members || [];
  const plan = team?.plan || "free";
  const maxMembers = plan === "pro" ? 5 : 1;
  const isOwner = teamMember?.role === "owner";
  const canInvite = members.length < maxMembers && isOwner;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Team</h1>
          <p className="text-muted-foreground">
            Manage your team members
          </p>
        </div>
        {canInvite && plan === "pro" && (
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Invite Member
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{team?.name || "Your Team"}</CardTitle>
          <CardDescription>
            {members.length} of {maxMembers} team members
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    {member.role === "owner" ? (
                      <Crown className="h-5 w-5 text-primary" />
                    ) : (
                      <User className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">
                      {member.user.name || member.user.email}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {member.user.email}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    member.role === "owner"
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {member.role}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {plan !== "pro" && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">
              Team collaboration requires Pro plan
            </h3>
            <p className="text-muted-foreground mb-4">
              Upgrade to Pro to invite up to 5 team members
            </p>
            <Link href="/dashboard/settings">
              <Button>Upgrade to Pro</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
