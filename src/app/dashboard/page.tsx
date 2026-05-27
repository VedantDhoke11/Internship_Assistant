'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  FileText,
  Calendar,
  Layers,
  Sparkles,
  ArrowUpRight,
  Plus,
  Briefcase,
  AlertCircle,
  Loader2,
  KanbanSquare,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Internship {
  id: string;
  title: string;
  company: string;
  source: string;
  skillsRequired: string[];
  stipend?: string;
}

interface Application {
  id: string;
  userId: string;
  internshipId: string;
  status: string;
  resumeUsed?: string;
  notes?: string;
  appliedAt: string;
  updatedAt: string;
  internship: Internship;
}

const STATUS_BADGE_MAP: Record<string, { label: string; className: string }> = {
  Saved: { label: 'Saved', className: 'bg-muted/50 text-muted-foreground' },
  Applied: { label: 'Applied', className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
  OA: { label: 'Assessment', className: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' },
  Interview: { label: 'Interview', className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  Offer: { label: 'Offer', className: 'bg-green-500/10 text-green-600 dark:text-green-400' },
  Rejected: { label: 'Rejected', className: 'bg-destructive/10 text-destructive' },
};

export default function DashboardPage() {
  const [applications, setApplications] = React.useState<Application[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [userName, setUserName] = React.useState('there');
  const [userEmail, setUserEmail] = React.useState<string | null>(null);

  // Load user session
  React.useEffect(() => {
    const loadUser = () => {
      try {
        const stored = window.localStorage.getItem('user');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.name) setUserName(parsed.name.split(' ')[0]);
          if (parsed.email) setUserEmail(parsed.email);
        }
      } catch {
        // Safe SSR check
      }
    };
    const handle = setTimeout(loadUser, 0);
    return () => clearTimeout(handle);
  }, []);

  // Fetch applications
  React.useEffect(() => {
    if (!userEmail) return;
    const fetchApps = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/applications?email=${encodeURIComponent(userEmail)}`);
        if (res.ok) {
          const data = await res.json();
          setApplications(data.applications || []);
        }
      } catch (e) {
        console.error('Failed to fetch dashboard data:', e);
      } finally {
        setIsLoading(false);
      }
    };
    const handle = setTimeout(fetchApps, 0);
    return () => clearTimeout(handle);
  }, [userEmail]);

  // Compute live metrics
  const activePipelines = applications.filter(
    (a) => !['Rejected', 'Offer'].includes(a.status)
  ).length;

  const interviewCount = applications.filter(
    (a) => a.status === 'Interview'
  ).length;

  const offerCount = applications.filter(
    (a) => a.status === 'Offer'
  ).length;

  const rejectedCount = applications.filter(
    (a) => a.status === 'Rejected'
  ).length;

  const appliedCount = applications.filter(
    (a) => a.status === 'Applied'
  ).length;

  const assessmentCount = applications.filter(
    (a) => a.status === 'OA'
  ).length;

  // Get recent 5 applications sorted by updatedAt
  const recentApps = [...applications]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  // Status distribution for mini chart
  const statusBreakdown = [
    { label: 'Saved', count: applications.filter((a) => a.status === 'Saved').length, color: 'bg-muted-foreground' },
    { label: 'Applied', count: appliedCount, color: 'bg-blue-500' },
    { label: 'Assessment', count: assessmentCount, color: 'bg-indigo-500' },
    { label: 'Interview', count: interviewCount, color: 'bg-amber-500' },
    { label: 'Offers', count: offerCount, color: 'bg-green-500' },
    { label: 'Rejected', count: rejectedCount, color: 'bg-destructive' },
  ];

  const totalApps = applications.length;

  // Helper for relative time
  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return 'yesterday';
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-300">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Welcome back, {userName} 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            {totalApps > 0
              ? `You're tracking ${totalApps} application${totalApps !== 1 ? 's' : ''} across your recruitment pipelines.`
              : 'Start tracking your internship applications to see your overview here.'}
          </p>
        </div>
        <Link href="/dashboard/applications">
          <Button className="rounded-xl flex items-center gap-2 shadow-sm hover:shadow-md transition-all cursor-pointer">
            <Plus className="h-4 w-4" />
            <span>Add Application</span>
          </Button>
        </Link>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </div>
      ) : (
        <>
          {/* Metrics Grid */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {/* Active Pipelines */}
            <Card className="rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Active Pipelines
                </CardTitle>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/5 text-primary">
                  <Layers className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activePipelines}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Excluding offers & rejected
                </p>
              </CardContent>
            </Card>

            {/* Interviews */}
            <Card className="rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Interviews
                </CardTitle>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
                  <Calendar className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{interviewCount}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  In interview stage
                </p>
              </CardContent>
            </Card>

            {/* Offers */}
            <Card className="rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Offers Secured 🎉
                </CardTitle>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10 text-green-500">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{offerCount}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {offerCount > 0 ? 'Congratulations!' : 'Keep applying, you got this!'}
                </p>
              </CardContent>
            </Card>

            {/* Total Tracked */}
            <Card className="rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Total Tracked
                </CardTitle>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/5 text-primary">
                  <KanbanSquare className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalApps}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Across all pipeline stages
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Layout */}
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
            {/* Left column: Recent Applications Feed */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="rounded-2xl border border-border bg-card shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Recent Activity</CardTitle>
                    <CardDescription>Your latest application updates and status changes.</CardDescription>
                  </div>
                  <Link href="/dashboard/applications">
                    <Button variant="ghost" size="sm" className="rounded-xl flex items-center gap-1 text-xs cursor-pointer">
                      <span>View All</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent className="divide-y divide-border p-0 px-6">
                  {recentApps.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted border border-border mb-4">
                        <Briefcase className="h-7 w-7 text-muted-foreground" />
                      </div>
                      <h3 className="text-sm font-semibold text-foreground mb-1">No applications yet</h3>
                      <p className="text-xs text-muted-foreground max-w-xs">
                        Head to the{' '}
                        <Link href="/dashboard/internships" className="text-primary font-semibold hover:underline">
                          Internship Feed
                        </Link>{' '}
                        or{' '}
                        <Link href="/dashboard/applications" className="text-primary font-semibold hover:underline">
                          Application Tracker
                        </Link>{' '}
                        to start tracking your progress.
                      </p>
                    </div>
                  ) : (
                    recentApps.map((app) => {
                      const badge = STATUS_BADGE_MAP[app.status] || STATUS_BADGE_MAP['Saved'];
                      return (
                        <div key={app.id} className="flex items-center justify-between py-4.5 group">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={cn(
                              "flex h-10 w-10 items-center justify-center rounded-xl border border-border shrink-0",
                              app.internship.source === 'linkedin' && 'bg-blue-500/5',
                              app.internship.source === 'internshala' && 'bg-orange-500/5',
                              app.internship.source === 'unstop' && 'bg-purple-500/5',
                              (!app.internship.source || app.internship.source === 'manual') && 'bg-muted',
                            )}>
                              <Briefcase className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-sm font-semibold truncate text-foreground leading-none">
                                {app.internship.title}
                              </h4>
                              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                <span>{app.internship.company}</span>
                                <span>&middot;</span>
                                <span className="flex items-center gap-0.5">
                                  <Clock className="h-3 w-3" />
                                  {timeAgo(app.updatedAt)}
                                </span>
                              </p>
                            </div>
                          </div>
                          <span className={cn(
                            'text-xs px-2.5 py-1 rounded-full font-semibold shrink-0',
                            badge.className,
                          )}>
                            {badge.label}
                          </span>
                        </div>
                      );
                    })
                  )}
                </CardContent>
                {recentApps.length > 0 && (
                  <CardFooter className="justify-center border-t border-border/50 py-3">
                    <Link href="/dashboard/applications">
                      <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground cursor-pointer">
                        View full Kanban board →
                      </Button>
                    </Link>
                  </CardFooter>
                )}
              </Card>
            </div>

            {/* Right column: Status Distribution & Quick Links */}
            <div className="space-y-6">
              {/* Status Distribution Card */}
              <Card className="rounded-2xl border border-border bg-card shadow-sm">
                <CardHeader>
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <FileText className="h-4.5 w-4.5 text-primary" />
                    <span>Pipeline Distribution</span>
                  </CardTitle>
                  <CardDescription className="text-xs">Breakdown of your applications by stage</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {totalApps === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4">No applications to display.</p>
                  ) : (
                    <>
                      {/* Horizontal stacked bar */}
                      <div className="flex h-3 w-full rounded-full overflow-hidden bg-muted/30 border border-border/50">
                        {statusBreakdown.map((s) => {
                          const pct = totalApps > 0 ? (s.count / totalApps) * 100 : 0;
                          if (pct === 0) return null;
                          return (
                            <div
                              key={s.label}
                              className={cn('h-full transition-all duration-500', s.color)}
                              style={{ width: `${pct}%` }}
                              title={`${s.label}: ${s.count}`}
                            />
                          );
                        })}
                      </div>
                      {/* Legend */}
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        {statusBreakdown.map((s) => (
                          <div key={s.label} className="flex items-center gap-2 text-xs">
                            <div className={cn('h-2.5 w-2.5 rounded-full shrink-0', s.color)} />
                            <span className="text-muted-foreground">{s.label}</span>
                            <span className="ml-auto font-bold text-foreground">{s.count}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Quick Navigation Card */}
              <Card className="rounded-2xl border border-primary/20 bg-primary/5 text-foreground shadow-sm relative overflow-hidden">
                {/* Background spotlight */}
                <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />
                <CardHeader className="space-y-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                  <CardDescription className="text-primary/70 dark:text-muted-foreground">
                    Jump to key areas of your workspace to manage your internship pipeline.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2.5">
                  <Link href="/dashboard/internships">
                    <Button variant="outline" size="sm" className="w-full justify-start rounded-xl flex items-center gap-2 bg-card/60 hover:bg-card cursor-pointer">
                      <Briefcase className="h-4 w-4 text-primary" />
                      <span className="font-semibold">Browse Internship Feed</span>
                      <ArrowUpRight className="h-3.5 w-3.5 ml-auto text-muted-foreground" />
                    </Button>
                  </Link>
                  <Link href="/dashboard/applications">
                    <Button variant="outline" size="sm" className="w-full justify-start rounded-xl flex items-center gap-2 bg-card/60 hover:bg-card cursor-pointer">
                      <KanbanSquare className="h-4 w-4 text-primary" />
                      <span className="font-semibold">Application Tracker</span>
                      <ArrowUpRight className="h-3.5 w-3.5 ml-auto text-muted-foreground" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* System status checklist */}
              <Card className="rounded-2xl border border-border bg-card shadow-sm">
                <CardHeader>
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <AlertCircle className="h-4.5 w-4.5 text-muted-foreground" />
                    <span>Platform Modules</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs space-y-2.5 text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span>Internship Feed Aggregator</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span>Kanban Application Tracker</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span>Supabase Auth & Database</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse" />
                    <span>Resume Intelligence (Coming soon)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse" />
                    <span>AI Career Advisor (Coming soon)</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
