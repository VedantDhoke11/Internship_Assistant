'use client';

import * as React from 'react';
import Link from 'next/link';
import { Sparkles, Quote, CheckCircle, GraduationCap } from 'lucide-react';

interface AuthLayoutWrapperProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export function AuthLayoutWrapper({ children, title, subtitle }: AuthLayoutWrapperProps) {
  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-background text-foreground transition-colors duration-300">
      {/* Left side: Premium Branding & Testimonials Panel */}
      <div className="hidden md:flex md:w-1/2 relative flex-col justify-between p-12 bg-gradient-to-b from-primary/10 via-accent/5 to-background border-r border-border overflow-hidden">
        {/* Decorative Grid */}
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,oklch(var(--border)/0.2)_1px,transparent_1px),linear-gradient(to_bottom,oklch(var(--border)/0.2)_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <div className="absolute top-1/4 left-1/4 -z-10 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />

        {/* Brand Header */}
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/20">
              <Sparkles className="h-5 w-5 text-accent-foreground dark:text-primary-foreground" />
            </div>
            <span className="font-sans text-xl font-bold tracking-tight text-foreground">
              Internship<span className="text-muted-foreground font-medium">OS</span>
            </span>
          </Link>
        </div>

        {/* Feature Checkpoints & Metrics */}
        <div className="space-y-8 max-w-lg my-auto">
          <div className="space-y-4">
            <h2 className="text-3xl font-extrabold tracking-tight leading-tight">
              Scale Your Career Search with AI-Powered Intelligence.
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              InternshipOS provides automatic internship aggregation, AI-driven ATS resume optimization, and RAG conversational coaching.
            </p>
          </div>

          <div className="space-y-3.5">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-primary shrink-0" />
              <span className="text-sm font-medium">Aggregate 1,000+ listings daily</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-primary shrink-0" />
              <span className="text-sm font-medium">Evaluate ATS compliance in under 5 seconds</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-primary shrink-0" />
              <span className="text-sm font-medium">Step-by-step interview prep advice</span>
            </div>
          </div>
        </div>

        {/* Student Testimonial */}
        <div className="space-y-4 max-w-lg border-t border-border/80 pt-6">
          <div className="flex items-center gap-1.5 text-yellow-500">
            <Quote className="h-5 w-5 text-primary rotate-180" />
          </div>
          <p className="text-xs text-muted-foreground italic leading-relaxed">
            &ldquo;Using InternshipOS, I tracked 45 applications, parsed my resume for each job description, and optimized my projects. I secured a Summer ML Intern role at Vercel!&rdquo;
          </p>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
              <GraduationCap className="h-4 w-4" />
            </div>
            <div className="text-[11px] leading-tight">
              <p className="font-semibold text-foreground">Sarah Jenkins</p>
              <p className="text-muted-foreground">CS Senior at Stanford University</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side: Interactive Form Container */}
      <div className="flex-1 flex flex-col justify-center items-center px-4 py-12 sm:px-6 lg:px-8 bg-background relative">
        {/* Glow effect on background mobile */}
        <div className="absolute top-1/4 right-1/4 -z-10 h-64 w-64 rounded-full bg-primary/5 blur-3xl md:hidden" />
        
        <div className="w-full max-w-md space-y-8 animate-in fade-in-50 slide-in-from-bottom-5 duration-300">
          <div className="text-center md:text-left space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {title}
            </h1>
            <p className="text-sm text-muted-foreground">
              {subtitle}
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-sm">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
