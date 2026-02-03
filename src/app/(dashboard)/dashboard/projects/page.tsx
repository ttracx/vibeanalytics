import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FolderKanban, Plus, ExternalLink, Settings } from "lucide-react";
import Link from "next/link";

export default async function ProjectsPage() {
  const session = await auth();
  if (!session?.user) return null;

  const teamMember = await prisma.teamMember.findFirst({
    where: { userId: session.user.id },
    include: {
      team: {
        include: {
          projects: {
            include: {
              _count: {
                select: { events: true },
              },
            },
            orderBy: { createdAt: "desc" },
          },
        },
      },
    },
  });

  const projects = teamMember?.team?.projects || [];
  const plan = teamMember?.team?.plan || "free";
  const maxProjects = plan === "pro" ? 10 : 1;
  const canCreateProject = projects.length < maxProjects;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground">
            Manage your analytics projects
          </p>
        </div>
        {canCreateProject && (
          <Link href="/dashboard/projects/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </Link>
        )}
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FolderKanban className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No projects yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first project to start tracking analytics
            </p>
            <Link href="/dashboard/projects/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Project
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card key={project.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{project.name}</CardTitle>
                  <Link href={`/dashboard/projects/${project.id}`}>
                    <Button variant="ghost" size="icon">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
                {project.domain && (
                  <CardDescription className="flex items-center gap-1">
                    <ExternalLink className="h-3 w-3" />
                    {project.domain}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total Events</span>
                  <span className="font-medium">
                    {project._count.events.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-muted-foreground">Created</span>
                  <span className="font-medium">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="mt-4 p-3 bg-muted rounded-md">
                  <p className="text-xs text-muted-foreground mb-1">Project ID</p>
                  <code className="text-xs font-mono break-all">{project.id}</code>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!canCreateProject && (
        <Card className="border-dashed">
          <CardContent className="py-6 text-center">
            <p className="text-muted-foreground mb-2">
              You&apos;ve reached the project limit for your plan
            </p>
            <Link href="/dashboard/settings">
              <Button variant="outline">Upgrade to Pro</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
