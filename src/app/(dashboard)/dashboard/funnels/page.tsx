import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Plus, ArrowRight } from "lucide-react";
import Link from "next/link";

export default async function FunnelsPage() {
  const session = await auth();
  if (!session?.user) return null;

  const teamMember = await prisma.teamMember.findFirst({
    where: { userId: session.user.id },
    include: {
      team: {
        include: {
          projects: {
            include: {
              funnels: {
                orderBy: { createdAt: "desc" },
              },
            },
          },
        },
      },
    },
  });

  const projects = teamMember?.team?.projects || [];
  const plan = teamMember?.team?.plan || "free";
  const funnels = projects.flatMap((p) =>
    p.funnels.map((f) => ({ ...f, projectName: p.name }))
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Funnels</h1>
          <p className="text-muted-foreground">
            Track conversion funnels and drop-off points
          </p>
        </div>
        {plan === "pro" && (
          <Link href="/dashboard/funnels/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Funnel
            </Button>
          </Link>
        )}
      </div>

      {plan !== "pro" ? (
        <Card>
          <CardContent className="py-12 text-center">
            <LineChart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Funnels require Pro plan</h3>
            <p className="text-muted-foreground mb-4">
              Upgrade to Pro to create custom conversion funnels
            </p>
            <Link href="/dashboard/settings">
              <Button>Upgrade to Pro</Button>
            </Link>
          </CardContent>
        </Card>
      ) : funnels.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <LineChart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No funnels yet</h3>
            <p className="text-muted-foreground mb-4">
              Create a funnel to track user conversion paths
            </p>
            <Link href="/dashboard/funnels/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Funnel
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {funnels.map((funnel) => {
            const steps = funnel.steps as { name: string; event: string }[];
            return (
              <Card key={funnel.id}>
                <CardHeader>
                  <CardTitle>{funnel.name}</CardTitle>
                  <CardDescription>{funnel.projectName}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center flex-wrap gap-2">
                    {steps.map((step, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-muted rounded text-sm">
                          {step.name}
                        </span>
                        {i < steps.length - 1 && (
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="mt-4">
                    <Link href={`/dashboard/funnels/${funnel.id}`}>
                      <Button variant="outline" size="sm" className="w-full">
                        View Funnel
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
