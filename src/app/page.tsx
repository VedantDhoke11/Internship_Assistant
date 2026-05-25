'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  Briefcase,
  Bot,
  FileText,
  BarChart3,
  CheckCircle,
  Github,
  LayoutDashboard,
} from 'lucide-react';
import { Navbar } from '@/components/layouts/navbar';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export default function Home() {
  const [emailInput, setEmailInput] = React.useState('');
  const [submitted, setSubmitted] = React.useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim()) {
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
      setEmailInput('');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-16 md:pt-32 md:pb-24 border-b border-border bg-gradient-to-b from-background via-accent/5 to-background">
          {/* Decorative background grid and light spots */}
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,oklch(var(--border)/0.3)_1px,transparent_1px),linear-gradient(to_bottom,oklch(var(--border)/0.3)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
          <div className="absolute top-0 right-1/4 -z-10 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute bottom-0 left-1/4 -z-10 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-xs font-semibold text-primary animate-pulse">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Stage 1 Foundation Ready</span>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl max-w-3xl mx-auto leading-[1.1] text-foreground">
              Automate and Master Your{' '}
              <span className="bg-gradient-to-r from-primary to-muted-foreground bg-clip-text text-transparent">
                Internship Search
              </span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              InternshipOS is an AI-powered co-pilot for college students. Aggregate openings, parse resumes with LLMs, track pipelines, and receive smart career counseling.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/dashboard"
                className={cn(
                  buttonVariants({ size: 'lg' }),
                  'rounded-xl px-8 font-semibold shadow-md shadow-primary/20 hover:scale-[1.02] transition-all flex items-center gap-2',
                )}
              >
                <span>Enter Platform Demo</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="https://github.com"
                target="_blank"
                className={cn(
                  buttonVariants({ size: 'lg', variant: 'outline' }),
                  'rounded-xl px-8 font-semibold hover:bg-accent flex items-center gap-2',
                )}
              >
                <Github className="h-4 w-4" />
                <span>View Repository</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Feature Highlights */}
        <section className="py-20 bg-background max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Future Architecture Modules
            </h2>
            <p className="text-muted-foreground">
              A production-ready foundation designed to scale and accommodate heavy LLM processing workloads.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <Card className="rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-all duration-200">
              <CardHeader className="space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Briefcase className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg">Smart Aggregation</CardTitle>
                <CardDescription>
                  Real-time listing feeds aggregated dynamically across portals.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 2 */}
            <Card className="rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-all duration-200">
              <CardHeader className="space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <FileText className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg">ATS Resume Parsing</CardTitle>
                <CardDescription>
                  Cross-compare resume content against vacancy requirements in seconds.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 3 */}
            <Card className="rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-all duration-200">
              <CardHeader className="space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Bot className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg">AI Advisor (RAG)</CardTitle>
                <CardDescription>
                  Conversational assistant powered by contextual vectors and job indices.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 4 */}
            <Card className="rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-all duration-200">
              <CardHeader className="space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg">Visual Kanban Tracker</CardTitle>
                <CardDescription>
                  Smooth drag-and-drop workflow tracking and performance analytics.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        {/* Component Sandbox Showcase */}
        <section className="py-20 border-t border-border bg-muted/30">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center max-w-3xl mx-auto space-y-4 mb-6">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Foundational Component Sandbox
              </h2>
              <p className="text-muted-foreground">
                Verify and test the custom atomic components shipped in this foundation setup.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Button Sandbox Card */}
              <Card className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-lg font-bold">Button Components</CardTitle>
                  <CardDescription>Standard styles configured via ShadCN & Class Variance Authority</CardDescription>
                </CardHeader>
                <CardContent className="px-0 flex flex-wrap gap-3">
                  <Button className="rounded-xl">Primary Button</Button>
                  <Button variant="secondary" className="rounded-xl">Secondary</Button>
                  <Button variant="outline" className="rounded-xl">Outline</Button>
                  <Button variant="ghost" className="rounded-xl">Ghost</Button>
                  <Button variant="destructive" className="rounded-xl">Destructive</Button>
                </CardContent>
                <CardFooter className="px-0 pb-0 text-xs text-muted-foreground">
                  File location: <code className="bg-muted px-1.5 py-0.5 rounded font-mono">src/components/ui/button.tsx</code>
                </CardFooter>
              </Card>

              {/* Input & Form Interaction Sandbox Card */}
              <Card className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-lg font-bold">Input & Forms</CardTitle>
                  <CardDescription>Tailwind v4 theme variables configured for inputs</CardDescription>
                </CardHeader>
                <CardContent className="px-0">
                  <form onSubmit={handleSubscribe} className="flex gap-2 max-w-md">
                    <Input
                      type="email"
                      placeholder="Enter university email..."
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      required
                      className="rounded-xl"
                    />
                    <Button type="submit" className="rounded-xl shrink-0">
                      Join Waitlist
                    </Button>
                  </form>
                  {submitted && (
                    <p className="text-xs text-green-600 dark:text-green-400 mt-2 flex items-center gap-1.5 animate-bounce">
                      <CheckCircle className="h-4 w-4" />
                      <span>Successfully subscribed to notifications!</span>
                    </p>
                  )}
                </CardContent>
                <CardFooter className="px-0 pb-0 text-xs text-muted-foreground">
                  File location: <code className="bg-muted px-1.5 py-0.5 rounded font-mono">src/components/ui/input.tsx</code>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-background py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold tracking-tight text-foreground">
              InternshipOS
            </span>
            <span className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} All rights reserved.
            </span>
          </div>
          <div className="flex gap-4">
            <Link href="/dashboard" className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
              <LayoutDashboard className="h-3.5 w-3.5" />
              <span>Platform Demo</span>
            </Link>
            <Link href="https://github.com" target="_blank" className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
              <Github className="h-3.5 w-3.5" />
              <span>GitHub</span>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
