'use client';

import * as React from 'react';
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
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  return (
    <div className="space-y-8 animate-in fade-in-50 duration-300">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Student Workspace
          </h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, John. Here is an overview of your active recruitment pipelines.
          </p>
        </div>
        <Button className="rounded-xl flex items-center gap-2 shadow-sm hover:shadow-md transition-all">
          <Plus className="h-4 w-4" />
          <span>Add Application</span>
        </Button>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {/* Metric 1 */}
        <Card className="rounded-2xl border border-border bg-card shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Active Pipelines
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/5 text-primary">
              <Layers className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-green-500 font-medium mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              <span>+3 from last week</span>
            </p>
          </CardContent>
        </Card>

        {/* Metric 2 */}
        <Card className="rounded-2xl border border-border bg-card shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Interviews Scheduled
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/5 text-primary">
              <Calendar className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground mt-1">
              Next scheduled: May 28th
            </p>
          </CardContent>
        </Card>

        {/* Metric 3 */}
        <Card className="rounded-2xl border border-border bg-card shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Average ATS Score
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/5 text-primary">
              <FileText className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">82%</div>
            <p className="text-xs text-green-500 font-medium mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              <span>+4% optimization trend</span>
            </p>
          </CardContent>
        </Card>

        {/* Metric 4 */}
        <Card className="rounded-2xl border border-border bg-card shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              AI Insight Rating
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/5 text-primary">
              <Sparkles className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Excellent</div>
            <p className="text-xs text-muted-foreground mt-1">
              Based on profile alignment
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
                <CardTitle className="text-lg">Recent Application Lifecycles</CardTitle>
                <CardDescription>Keep track of saved and applied roles.</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="rounded-xl flex items-center gap-1 text-xs">
                <span>View All</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Button>
            </CardHeader>
            <CardContent className="divide-y divide-border p-0 px-6">
              {[
                { title: 'AI Engineering Intern', company: 'Google DeepMind', status: 'OA', date: 'Applied 2 days ago', badgeClass: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400' },
                { title: 'Frontend Software Intern', company: 'Vercel Inc.', status: 'Interview', date: 'Interview tomorrow', badgeClass: 'bg-green-500/10 text-green-600 dark:text-green-400' },
                { title: 'Machine Learning Assistant', company: 'OpenAI Corp.', status: 'Applied', date: 'Applied 5 days ago', badgeClass: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
              ].map((app, index) => (
                <div key={index} className="flex items-center justify-between py-4.5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted border border-border">
                      <Briefcase className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold truncate text-foreground leading-none">{app.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{app.company} &middot; {app.date}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${app.badgeClass}`}>
                    {app.status}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right column: AI advisor prompt */}
        <div className="space-y-6">
          <Card className="rounded-2xl border border-primary/20 bg-primary/5 text-foreground shadow-sm relative overflow-hidden">
            {/* Background spotlight */}
            <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />
            <CardHeader className="space-y-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
                <Sparkles className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg">AI Career Advisor</CardTitle>
              <CardDescription className="text-primary/70 dark:text-muted-foreground">
                Ask anything about your interview preparation, skill gap anomalies, or application strategies.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl border border-primary/10 bg-card p-3 text-xs text-muted-foreground leading-relaxed shadow-sm">
                &ldquo;Your resume score for Google DeepMind is **84%**. You are missing keywords relating to *Distributed Systems* and *Transformers Architecture*.&rdquo;
              </div>
            </CardContent>
            <CardFooter>
              <Button size="sm" className="w-full rounded-xl flex items-center justify-center gap-2">
                <span>Open Advisor Chat</span>
                <Sparkles className="h-3.5 w-3.5" />
              </Button>
            </CardFooter>
          </Card>

          {/* System status checklist */}
          <Card className="rounded-2xl border border-border bg-card shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <AlertCircle className="h-4.5 w-4.5 text-muted-foreground" />
                <span>Active Setup Checkpoints</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-2.5 text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span>Next.js 15+ & TypeScript Setup</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span>Tailwind CSS v4 CSS variables</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span>ShadCN Base-Nova configuration</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse" />
                <span>Stage 2 Auth Module integration (Pending)</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
