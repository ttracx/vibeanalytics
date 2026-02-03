import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Users, MousePointer, TrendingUp } from "lucide-react";
import { DashboardCharts } from "@/components/dashboard/charts";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) return null;

  // Get user's team and project
  const teamMember = await prisma.teamMember.findFirst({
    where: { userId: session.user.id },
    include: { 
      team: { 
        include: { 
          projects: true 
        } 
      } 
    },
  });

  const project = teamMember?.team?.projects[0];
  
  // Get analytics data
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  let totalEvents = 0;
  let uniqueUsers = 0;
  let pageViews = 0;
  let weeklyEvents: { date: string; count: number }[] = [];

  if (project) {
    // Total events (30 days)
    totalEvents = await prisma.event.count({
      where: {
        projectId: project.id,
        timestamp: { gte: thirtyDaysAgo },
      },
    });

    // Unique users (30 days)
    const uniqueUserResult = await prisma.event.groupBy({
      by: ["sessionId"],
      where: {
        projectId: project.id,
        timestamp: { gte: thirtyDaysAgo },
      },
    });
    uniqueUsers = uniqueUserResult.length;

    // Page views (30 days)
    pageViews = await prisma.event.count({
      where: {
        projectId: project.id,
        name: "page_view",
        timestamp: { gte: thirtyDaysAgo },
      },
    });

    // Events per day (last 7 days)
    const eventsByDay = await prisma.event.groupBy({
      by: ["timestamp"],
      where: {
        projectId: project.id,
        timestamp: { gte: sevenDaysAgo },
      },
      _count: true,
    });

    // Aggregate by day
    const dayMap = new Map<string, number>();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split("T")[0];
      dayMap.set(dateStr, 0);
    }
    eventsByDay.forEach((e) => {
      const dateStr = e.timestamp.toISOString().split("T")[0];
      if (dayMap.has(dateStr)) {
        dayMap.set(dateStr, (dayMap.get(dateStr) || 0) + e._count);
      }
    });
    weeklyEvents = Array.from(dayMap.entries()).map(([date, count]) => ({
      date,
      count,
    }));
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here&apos;s an overview of your analytics.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Events"
          value={totalEvents.toLocaleString()}
          description="Last 30 days"
          icon={<MousePointer className="h-4 w-4" />}
        />
        <StatsCard
          title="Unique Users"
          value={uniqueUsers.toLocaleString()}
          description="Last 30 days"
          icon={<Users className="h-4 w-4" />}
        />
        <StatsCard
          title="Page Views"
          value={pageViews.toLocaleString()}
          description="Last 30 days"
          icon={<BarChart3 className="h-4 w-4" />}
        />
        <StatsCard
          title="Avg Events/User"
          value={uniqueUsers > 0 ? (totalEvents / uniqueUsers).toFixed(1) : "0"}
          description="Last 30 days"
          icon={<TrendingUp className="h-4 w-4" />}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Events Over Time</CardTitle>
            <CardDescription>Daily events for the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <DashboardCharts data={weeklyEvents} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Get started with your analytics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg border bg-muted/50">
              <h4 className="font-medium mb-2">Install Tracking Script</h4>
              <code className="text-xs bg-background p-2 rounded block overflow-x-auto">
                {`<script src="${process.env.NEXT_PUBLIC_APP_URL}/tracker.js" data-project="${project?.id || "YOUR_PROJECT_ID"}"></script>`}
              </code>
            </div>
            <div className="p-4 rounded-lg border bg-muted/50">
              <h4 className="font-medium mb-2">Track Custom Events</h4>
              <code className="text-xs bg-background p-2 rounded block overflow-x-auto">
                {`vibeanalytics.track("button_click", { button: "signup" })`}
              </code>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatsCard({
  title,
  value,
  description,
  icon,
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <span className="text-muted-foreground">{icon}</span>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
