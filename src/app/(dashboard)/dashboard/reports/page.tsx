import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Plus, Download } from "lucide-react";
import Link from "next/link";

export default async function ReportsPage() {
  const session = await auth();
  if (!session?.user) return null;

  const teamMember = await prisma.teamMember.findFirst({
    where: { userId: session.user.id },
    include: {
      team: {
        include: {
          projects: {
            include: {
              reports: {
                orderBy: { createdAt: "desc" },
                include: { user: { select: { name: true, email: true } } },
              },
            },
          },
        },
      },
    },
  });

  const projects = teamMember?.team?.projects || [];
  const plan = teamMember?.team?.plan || "free";
  const reports = projects.flatMap((p) =>
    p.reports.map((r) => ({ ...r, projectName: p.name, projectId: p.id }))
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-muted-foreground">
            Create and share custom analytics reports
          </p>
        </div>
        {plan === "pro" && (
          <Link href="/dashboard/reports/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Report
            </Button>
          </Link>
        )}
      </div>

      {plan !== "pro" ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Custom Reports require Pro plan</h3>
            <p className="text-muted-foreground mb-4">
              Upgrade to Pro to create and share custom reports
            </p>
            <Link href="/dashboard/settings">
              <Button>Upgrade to Pro</Button>
            </Link>
          </CardContent>
        </Card>
      ) : reports.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No reports yet</h3>
            <p className="text-muted-foreground mb-4">
              Create a custom report to analyze your data
            </p>
            <Link href="/dashboard/reports/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Report
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {reports.map((report) => (
            <Card key={report.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{report.name}</CardTitle>
                  {report.isPublic && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      Public
                    </span>
                  )}
                </div>
                <CardDescription>
                  {report.projectName} • {report.user.name || report.user.email}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {report.description && (
                  <p className="text-sm text-muted-foreground mb-4">
                    {report.description}
                  </p>
                )}
                <div className="flex gap-2">
                  <Link href={`/dashboard/reports/${report.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      View
                    </Button>
                  </Link>
                  <a
                    href={`/api/export?projectId=${report.projectId}&format=csv`}
                    className="flex-1"
                  >
                    <Button variant="outline" size="sm" className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
