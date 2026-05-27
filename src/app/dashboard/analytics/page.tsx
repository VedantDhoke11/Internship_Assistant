'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  BarChart3,
  TrendingUp,
  FileText,
  Calendar,
  Layers,
  Sparkles,
  ArrowUpRight,
  Briefcase,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Clock,
  Award,
  Zap,
  Target,
  ArrowRight,
  ChevronRight,
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
  location?: string;
}

interface Application {
  id: string;
  userId: string;
  internshipId: string;
  status: string;
  appliedAt: string;
  updatedAt: string;
  internship: Internship;
}

interface ResumeDetails {
  id: string;
  fileUrl: string;
  atsScore: number;
  createdAt: string;
}

interface AIAnalysis {
  feedback: string;
  missingKeywords: string[];
  improvements: string[];
}

export default function AnalyticsPage() {
  const [applications, setApplications] = React.useState<Application[]>([]);
  const [resume, setResume] = React.useState<ResumeDetails | null>(null);
  const [aiAnalysis, setAiAnalysis] = React.useState<AIAnalysis | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [userEmail, setUserEmail] = React.useState<string | null>(null);
  const [userId, setUserId] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState<'overview' | 'funnel' | 'resume'>('overview');

  // Load user session
  React.useEffect(() => {
    const loadUser = () => {
      try {
        const stored = window.sessionStorage.getItem('user');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.email) setUserEmail(parsed.email);
          if (parsed.id) setUserId(parsed.id);
        }
      } catch (err) {
        console.error('Session load error:', err);
      }
    };
    const handle = setTimeout(loadUser, 0);
    return () => clearTimeout(handle);
  }, []);

  // Fetch applications and resume info
  React.useEffect(() => {
    if (!userEmail || !userId) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        // 1. Fetch applications
        const appsRes = await fetch(`/api/applications?email=${encodeURIComponent(userEmail)}`);
        let apps: Application[] = [];
        if (appsRes.ok) {
          const appsData = await appsRes.json();
          apps = appsData.applications || [];
          setApplications(apps);
        }

        // 2. Fetch resume details
        const resumeRes = await fetch(`/api/resume?userId=${userId}`);
        if (resumeRes.ok) {
          const resumeData = await resumeRes.json();
          setResume(resumeData.resume);
          
          // 3. Attempt to fetch pre-existing resume analysis from Groq backend if resume exists
          if (resumeData.resume) {
            try {
              const analysisRes = await fetch('/api/resume/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId }),
              });
              if (analysisRes.ok) {
                const analysisData = await analysisRes.json();
                setAiAnalysis(analysisData);
              }
            } catch (err) {
              console.warn('AI Resume analysis endpoint offline or failed:', err);
            }
          }
        }
      } catch (e) {
        console.error('Failed to load analytics data:', e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userEmail, userId]);

  // Request new AI Resume analysis
  const handleScanResume = async () => {
    if (!userId || !resume) return;
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/resume/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (res.ok) {
        const data = await res.json();
        setAiAnalysis(data);
        if (data.atsScore !== undefined) {
          setResume((prev) => prev ? { ...prev, atsScore: data.atsScore } : null);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Compute stats from real applications
  const totalApps = applications.length;
  const savedCount = applications.filter((a) => a.status === 'Saved').length;
  const appliedCount = applications.filter((a) => a.status === 'Applied').length;
  const oaCount = applications.filter((a) => a.status === 'OA').length;
  const interviewCount = applications.filter((a) => a.status === 'Interview').length;
  const offerCount = applications.filter((a) => a.status === 'Offer').length;
  const rejectedCount = applications.filter((a) => a.status === 'Rejected').length;

  const activePipelines = appliedCount + oaCount + interviewCount;
  
  // Conversion formula: offers / (all applied outcomes: applied + OA + interviews + offers + rejections)
  const totalAppliedOutcomes = appliedCount + oaCount + interviewCount + offerCount + rejectedCount;
  const offerConversionRate = totalAppliedOutcomes > 0 
    ? Math.round((offerCount / totalAppliedOutcomes) * 100) 
    : 0;

  const interviewRate = totalAppliedOutcomes > 0 
    ? Math.round(((interviewCount + offerCount) / totalAppliedOutcomes) * 100) 
    : 0;

  // Platform distribution
  const platformStats = React.useMemo(() => {
    const counts = { linkedin: 0, internshala: 0, unstop: 0 };
    const offers = { linkedin: 0, internshala: 0, unstop: 0 };
    
    applications.forEach((a) => {
      const src = a.internship.source.toLowerCase() as 'linkedin' | 'internshala' | 'unstop';
      if (counts[src] !== undefined) {
        counts[src]++;
        if (a.status === 'Offer') {
          offers[src]++;
        }
      }
    });

    const total = counts.linkedin + counts.internshala + counts.unstop || 1;
    
    return [
      {
        name: 'LinkedIn',
        count: counts.linkedin,
        percentage: totalApps > 0 ? Math.round((counts.linkedin / total) * 100) : 0,
        offers: offers.linkedin,
        color: 'bg-blue-600',
        strokeColor: '#2563eb',
        textColor: 'text-blue-500',
        badge: 'bg-blue-600/10 border-blue-600/20 text-blue-500',
      },
      {
        name: 'Internshala',
        count: counts.internshala,
        percentage: totalApps > 0 ? Math.round((counts.internshala / total) * 100) : 0,
        offers: offers.internshala,
        color: 'bg-orange-500',
        strokeColor: '#f97316',
        textColor: 'text-orange-500',
        badge: 'bg-orange-500/10 border-orange-500/20 text-orange-500',
      },
      {
        name: 'Unstop',
        count: counts.unstop,
        percentage: totalApps > 0 ? Math.round((counts.unstop / total) * 100) : 0,
        offers: offers.unstop,
        color: 'bg-purple-600',
        strokeColor: '#9333ea',
        textColor: 'text-purple-500',
        badge: 'bg-purple-600/10 border-purple-600/20 text-purple-500',
      },
    ];
  }, [applications, totalApps]);

  // Category distribution
  const categoryStats = React.useMemo(() => {
    const cats: Record<string, number> = {};
    applications.forEach((a) => {
      const title = a.internship.title.toLowerCase();
      let cat = 'Other';
      if (title.includes('design') || title.includes('ux') || title.includes('ui') || title.includes('creative') || title.includes('graphic')) {
        cat = 'Design & Creative';
      } else if (title.includes('data') || title.includes('ml') || title.includes('ai') || title.includes('analyst') || title.includes('analytics') || title.includes('machine learning')) {
        cat = 'Data Science & Analytics';
      } else if (title.includes('product') || title.includes('pm')) {
        cat = 'Product Management';
      } else if (title.includes('sales') || title.includes('business') || title.includes('marketing') || title.includes('bd')) {
        cat = 'Business & Marketing';
      } else if (title.includes('software') || title.includes('developer') || title.includes('sde') || title.includes('backend') || title.includes('frontend') || title.includes('full')) {
        cat = 'Software Development';
      }
      cats[cat] = (cats[cat] || 0) + 1;
    });

    const list = Object.entries(cats).map(([name, count]) => ({
      name,
      count,
      percentage: totalApps > 0 ? Math.round((count / totalApps) * 100) : 0,
    }));
    
    return list.sort((a, b) => b.count - a.count);
  }, [applications, totalApps]);

  // Timeline statistics (last 7 days activity)
  const timelineData = React.useMemo(() => {
    const dates: Record<string, number> = {};
    const today = new Date();
    
    // Seed last 7 days with 0
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      dates[dateStr] = 0;
    }

    applications.forEach((a) => {
      const dateStr = a.appliedAt ? a.appliedAt.split('T')[0] : a.updatedAt.split('T')[0];
      if (dates[dateStr] !== undefined) {
        dates[dateStr]++;
      }
    });

    return Object.entries(dates).map(([date, count]) => {
      const formattedDate = new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      return { date: formattedDate, rawDate: date, count };
    });
  }, [applications]);

  // Render loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="flex flex-col gap-2">
          <div className="h-8 bg-muted rounded w-1/4" />
          <div className="h-4 bg-muted rounded w-1/2" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, idx) => (
            <Card key={idx} className="h-28 rounded-2xl bg-card/40 border border-border" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 h-96 rounded-2xl bg-card/40 border border-border" />
          <Card className="h-96 rounded-2xl bg-card/40 border border-border" />
        </div>
      </div>
    );
  }

  // Zero-state check
  const hasNoData = totalApps === 0;

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-300 relative pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
            <BarChart3 className="h-8 w-8 text-primary animate-pulse" />
            <span>Analytics Insights</span>
          </h1>
          <p className="text-muted-foreground mt-1.5 max-w-2xl">
            Analyze your application progression, match-rates, and receive ATS optimization insights based on your uploaded resume.
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-border/60 pb-px gap-2 overflow-x-auto">
        {[
          { id: 'overview', title: 'Performance Overview', icon: BarChart3 },
          { id: 'funnel', title: 'Pipeline Funnel', icon: Layers },
          { id: 'resume', title: 'Resume ATS Alignment', icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "px-5 py-2.5 text-sm font-semibold rounded-t-xl transition-all relative flex items-center gap-2 whitespace-nowrap cursor-pointer",
                isActive 
                  ? "text-primary border-b-2 border-primary bg-primary/5 font-bold" 
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/40"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.title}</span>
            </button>
          );
        })}
      </div>

      {/* 1. OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="rounded-2xl border border-border bg-card/30 hover:bg-card/50 transition-all duration-300 relative overflow-hidden group">
              <div className="absolute top-0 right-0 h-24 w-24 bg-primary/5 rounded-bl-full -z-10 group-hover:scale-110 transition-transform" />
              <CardHeader className="pb-2">
                <CardDescription className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Briefcase className="h-3.5 w-3.5 text-primary" />
                  Total Applications
                </CardDescription>
                <CardTitle className="text-3xl font-extrabold text-foreground pt-1">
                  {totalApps}
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-4">
                <p className="text-xs text-muted-foreground">
                  Saved or applied internship opportunities.
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border border-border bg-card/30 hover:bg-card/50 transition-all duration-300 relative overflow-hidden group">
              <div className="absolute top-0 right-0 h-24 w-24 bg-blue-500/5 rounded-bl-full -z-10 group-hover:scale-110 transition-transform" />
              <CardHeader className="pb-2">
                <CardDescription className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-blue-500" />
                  Active Pipelines
                </CardDescription>
                <CardTitle className="text-3xl font-extrabold text-foreground pt-1">
                  {activePipelines}
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-4">
                <p className="text-xs text-muted-foreground">
                  Applications currently in progress.
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border border-border bg-card/30 hover:bg-card/50 transition-all duration-300 relative overflow-hidden group">
              <div className="absolute top-0 right-0 h-24 w-24 bg-amber-500/5 rounded-bl-full -z-10 group-hover:scale-110 transition-transform" />
              <CardHeader className="pb-2">
                <CardDescription className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Target className="h-3.5 w-3.5 text-amber-500" />
                  Interview Pass Rate
                </CardDescription>
                <CardTitle className="text-3xl font-extrabold text-foreground pt-1">
                  {interviewRate}%
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-4">
                <p className="text-xs text-muted-foreground">
                  Outcomes resulting in interviews.
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border border-border bg-card/30 hover:bg-card/50 transition-all duration-300 relative overflow-hidden group">
              <div className="absolute top-0 right-0 h-24 w-24 bg-green-500/5 rounded-bl-full -z-10 group-hover:scale-110 transition-transform" />
              <CardHeader className="pb-2">
                <CardDescription className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Award className="h-3.5 w-3.5 text-green-500" />
                  Offer Conversion
                </CardDescription>
                <CardTitle className="text-3xl font-extrabold text-foreground pt-1">
                  {offerConversionRate}%
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-4">
                <p className="text-xs text-muted-foreground">
                  Offers received out of final outcomes.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Render real-time graphics always (0 values if empty) */}
          <>
              {/* Source distribution and category list split */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Platform Distribution Card */}
                <Card className="rounded-2xl border border-border bg-card/30 backdrop-blur-md lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                      <Layers className="h-5 w-5 text-primary" />
                      <span>Platform Placement Volume</span>
                    </CardTitle>
                    <CardDescription>
                      Comparative tracking share by LinkedIn, Internshala, and Unstop.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8 py-4">
                      {/* SVG Bar Stack */}
                      <div className="w-full space-y-4">
                        {platformStats.map((platform) => {
                          return (
                            <div key={platform.name} className="space-y-1.5">
                              <div className="flex items-center justify-between text-xs font-bold">
                                <span className="flex items-center gap-2">
                                  <span className={cn("h-3 w-3 rounded-full", platform.color)} />
                                  <span>{platform.name}</span>
                                </span>
                                <span className="text-muted-foreground">
                                  {platform.count} {platform.count === 1 ? 'job' : 'jobs'} ({platform.percentage}%)
                                </span>
                              </div>
                              <div className="h-3 w-full bg-muted/40 rounded-full overflow-hidden border border-border/10">
                                <div 
                                  className={cn("h-full rounded-full transition-all duration-1000", platform.color)}
                                  style={{ width: `${platform.percentage}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* SVG Circle Graphic representation */}
                      <div className="flex-shrink-0 relative h-36 w-36 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="40" fill="transparent" stroke="#2a2e3d" strokeWidth="12" />
                          {(() => {
                            let accumPct = 0;
                            return platformStats.map((p, idx) => {
                              const val = p.percentage || 0;
                              if (val === 0) return null;
                              const dashArray = 2 * Math.PI * 40; // 251.2
                              const strokeDashOffset = dashArray - (accumPct / 100) * dashArray;
                              accumPct += val;

                              return (
                                <circle
                                  key={idx}
                                  cx="50"
                                  cy="50"
                                  r="40"
                                  fill="transparent"
                                  stroke={p.strokeColor}
                                  strokeWidth="12"
                                  strokeDasharray={`${(val / 100) * dashArray} ${dashArray}`}
                                  strokeDashoffset={-strokeDashOffset}
                                  className="transition-all duration-1000"
                                />
                              );
                            });
                          })()}
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                          <span className="text-lg font-extrabold text-foreground">
                            {platformStats.filter(p => p.count > 0).length}
                          </span>
                          <span className="text-[10px] text-muted-foreground uppercase font-bold">Channels</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Category Breakdown Card */}
                <Card className="rounded-2xl border border-border bg-card/30 backdrop-blur-md">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                      <Briefcase className="h-5 w-5 text-primary" />
                      <span>Category Target</span>
                    </CardTitle>
                    <CardDescription>
                      Your targeted internship sectors.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-6">
                    <div className="space-y-4">
                      {categoryStats.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground">
                          <p className="text-xs font-semibold">No applications categorized yet.</p>
                          <p className="text-[10px] mt-1">Targeted sectors will display here.</p>
                        </div>
                      ) : (
                        categoryStats.slice(0, 5).map((cat, idx) => (
                          <div key={idx} className="space-y-1.5">
                            <div className="flex justify-between text-xs">
                              <span className="font-bold text-foreground truncate max-w-[150px]">{cat.name}</span>
                              <span className="text-muted-foreground font-semibold">{cat.count} ({cat.percentage}%)</span>
                            </div>
                            <div className="h-2 w-full bg-muted/40 rounded-full overflow-hidden">
                              <div className="h-full bg-primary rounded-full" style={{ width: `${cat.percentage}%` }} />
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Timeline Activity Row */}
              <Card className="rounded-2xl border border-border bg-card/30 backdrop-blur-md">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      <span>Timeline Tracking Activity</span>
                    </CardTitle>
                    <CardDescription>
                      Your application volume trends over the last 7 active calendar dates.
                    </CardDescription>
                  </div>
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </CardHeader>
                <CardContent className="py-2">
                  <div className="h-44 w-full relative">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 700 150">
                      <defs>
                        <linearGradient id="gradient-area" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      
                      {/* Grid lines */}
                      <line x1="50" y1="20" x2="650" y2="20" stroke="#2d3748" strokeDasharray="3 3" />
                      <line x1="50" y1="65" x2="650" y2="65" stroke="#2d3748" strokeDasharray="3 3" />
                      <line x1="50" y1="110" x2="650" y2="110" stroke="#2d3748" strokeDasharray="3 3" />
                      <line x1="50" y1="130" x2="650" y2="130" stroke="#4a5568" strokeWidth="1.5" />

                      {/* Draw points & paths */}
                      {(() => {
                        const width = 600;
                        const maxVal = Math.max(...timelineData.map(d => d.count), 1) + 1;
                        const points = timelineData.map((d, i) => {
                          const x = 50 + (i * (width / (timelineData.length - 1)));
                          const y = 130 - (d.count / maxVal) * 110;
                          return { x, y, val: d.count, label: d.date };
                        });

                        const pathD = points.reduce((acc, p, idx) => {
                          return acc + `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y} `;
                        }, '');

                        const areaD = pathD + `L ${points[points.length - 1].x} 130 L ${points[0].x} 130 Z`;

                        return (
                          <>
                            {/* Area */}
                            <path d={areaD} fill="url(#gradient-area)" />
                            
                            {/* Line */}
                            <path d={pathD} fill="none" stroke="#6366f1" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                            
                            {/* Dots & Labels */}
                            {points.map((p, idx) => (
                              <g key={idx} className="group/dot cursor-pointer">
                                <circle cx={p.x} cy={p.y} r="5" fill="#6366f1" stroke="#fff" strokeWidth="1.5" className="hover:r-7 transition-all" />
                                <text x={p.x} y={p.y - 12} textAnchor="middle" fill="#a0aec0" fontSize="10" fontWeight="bold">
                                  {p.val}
                                </text>
                                <text x={p.x} y="145" textAnchor="middle" fill="#718096" fontSize="9" fontWeight="bold">
                                  {p.label}
                                </text>
                              </g>
                            ))}
                          </>
                        );
                      })()}
                    </svg>
                  </div>
                </CardContent>
              </Card>
            </>
        </div>
      )}

      {/* 2. FUNNEL TAB */}
      {activeTab === 'funnel' && (
        <Card className="rounded-2xl border border-border bg-card/30 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Layers className="h-5.5 w-5.5 text-primary" />
              <span>Conversion Funnel Analysis</span>
            </CardTitle>
            <CardDescription>
              Track drop-off volume at each stage of your internship applications pipeline.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 pb-10">
              <>
                {/* Visual Funnel layout */}
                <div className="max-w-2xl mx-auto space-y-4 pt-4">
                  {(() => {
                    const stages = [
                      { label: 'Saved (Interest)', count: savedCount + appliedCount + oaCount + interviewCount + offerCount + rejectedCount, color: 'bg-indigo-600/90', val: 100 },
                      { label: 'Applied (Outward)', count: appliedCount + oaCount + interviewCount + offerCount + rejectedCount, color: 'bg-blue-600/90', val: 80 },
                      { label: 'Assessment (OA)', count: oaCount + interviewCount + offerCount, color: 'bg-sky-600/90', val: 60 },
                      { label: 'Interview (Rounds)', count: interviewCount + offerCount, color: 'bg-amber-600/90', val: 40 },
                      { label: 'Offers (Secured)', count: offerCount, color: 'bg-green-600/90', val: 20 },
                    ];

                    const maxCount = stages[0].count || 1;

                    return stages.map((s, idx) => {
                      const pct = Math.round((s.count / maxCount) * 100);
                      const scaleWidth = 100 - (idx * 8);

                      return (
                        <div key={idx} className="flex items-center gap-4 group">
                          <span className="w-36 text-right text-xs font-extrabold text-muted-foreground truncate">
                            {s.label}
                          </span>
                          
                          <div className="flex-1 relative flex items-center justify-center">
                            <div 
                              className={cn("h-11 rounded-xl flex items-center justify-between px-4 text-xs font-bold text-white shadow-lg transition-all duration-500 hover:brightness-110", s.color)}
                              style={{ 
                                width: `${scaleWidth}%`,
                                opacity: s.count > 0 ? 1 : 0.4
                              }}
                            >
                              <span className="truncate">{s.count} {s.count === 1 ? 'role' : 'roles'}</span>
                              <span className="text-[10px] font-extrabold bg-black/20 px-2 py-0.5 rounded-full">
                                {pct}%
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>

                {/* Insight Tip Card */}
                <div className="max-w-2xl mx-auto p-4 rounded-xl bg-primary/5 border border-primary/10 flex gap-3 text-xs leading-relaxed">
                  <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-bold text-primary">Pipeline conversion audit</span>
                    <p className="text-muted-foreground">
                      {totalApps === 0 ? (
                        <span>No application records found. Browse the Internship Feed and bookmark or apply to internships to track your progression funnel in real-time.</span>
                      ) : offerCount === 0 && rejectedCount > 0 ? (
                        <span>Your conversion to Offers is low. To optimize your success, target roles that are highly aligned with your core skills. Scroll to the **Resume ATS Alignment** tab to see keyword optimizations!</span>
                      ) : interviewCount > 0 && offerCount === 0 ? (
                        <span>You have interviews scheduled but no offers recorded yet. Use the **AI Career Advisor** chat space to practice tailored role-specific mock interview questions!</span>
                      ) : (
                        <span>Your progression funnel looks healthy. Keep active applications in the pipeline. Regularly apply to 2-3 fresh opportunities from the **Internship Feed** weekly to maintain pipeline health.</span>
                      )}
                    </p>
                  </div>
                </div>
              </>
          </CardContent>
        </Card>
      )}

      {/* 3. RESUME TAB */}
      {activeTab === 'resume' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Radial Score Indicator Card */}
          <Card className="rounded-2xl border border-border bg-card/30 backdrop-blur-md flex flex-col justify-between overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                <span>Resume Fit Index</span>
              </CardTitle>
              <CardDescription>
                AI ATS score computed from your resume.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-6">
              {resume ? (
                <div className="relative h-44 w-44 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="#2a2e3d" strokeWidth="8" />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="#4f46e5"
                      strokeWidth="8"
                      strokeDasharray="251.2"
                      strokeDashoffset={251.2 - (resume.atsScore / 100) * 251.2}
                      strokeLinecap="round"
                      className="transition-all duration-1000 shadow-glow"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-4xl font-black text-foreground">{resume.atsScore}</span>
                    <span className="text-[10px] text-muted-foreground uppercase font-extrabold tracking-wider">ATS Score</span>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-4 py-6">
                  <div className="h-16 w-16 bg-muted/50 rounded-2xl flex items-center justify-center text-muted-foreground mx-auto">
                    <FileText className="h-8 w-8" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-foreground">No Resume Uploaded</p>
                    <p className="text-xs text-muted-foreground max-w-[200px]">
                      Upload your PDF resume to scan for ATS keywords and align skills.
                    </p>
                  </div>
                  <Link href="/dashboard/resumes">
                    <Button size="sm" className="rounded-xl font-bold mt-2 cursor-pointer">
                      Go to Upload
                      <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
            {resume && (
              <CardFooter className="border-t border-border/50 bg-muted/5 px-6 py-4 flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-semibold">
                  Scanned: {new Date(resume.createdAt).toLocaleDateString()}
                </span>
                <Button 
                  onClick={handleScanResume} 
                  disabled={isAnalyzing} 
                  size="sm" 
                  variant="outline" 
                  className="rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Scanning...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Re-Scan Fit</span>
                    </>
                  )}
                </Button>
              </CardFooter>
            )}
          </Card>

          {/* AI Advisor Resume Keywords Optimization */}
          <Card className="rounded-2xl border border-border bg-card/30 backdrop-blur-md lg:col-span-2 flex flex-col justify-between">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <span>ATS Optimization Insights</span>
              </CardTitle>
              <CardDescription>
                AI recommendations to align your profile and secure software interviews.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {resume ? (
                <>
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Zap className="h-3.5 w-3.5 text-amber-500" />
                      <span>Missing Core Skills & Keywords</span>
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {aiAnalysis && aiAnalysis.missingKeywords && aiAnalysis.missingKeywords.length > 0 ? (
                        aiAnalysis.missingKeywords.map((kw, idx) => (
                          <span 
                            key={idx} 
                            className="text-xs bg-amber-500/10 text-amber-500 border border-amber-500/15 px-2.5 py-1 rounded-lg font-semibold"
                          >
                            +{kw}
                          </span>
                        ))
                      ) : (
                        <p className="text-xs text-muted-foreground italic">
                          No keywords analyzed yet. Click &quot;Re-Scan Fit&quot; below to analyze your resume.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                      <span>Actionable Improvements</span>
                    </h4>
                    <div className="space-y-2">
                      {aiAnalysis && aiAnalysis.improvements && aiAnalysis.improvements.length > 0 ? (
                        aiAnalysis.improvements.map((imp, idx) => (
                          <div key={idx} className="flex gap-2.5 text-xs text-foreground/90 bg-muted/20 border border-border/40 p-2.5 rounded-xl">
                            <ChevronRight className="h-4 w-4 text-primary shrink-0" />
                            <span>{imp}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-muted-foreground italic">
                          No actionable improvements suggested yet. Click &quot;Re-Scan Fit&quot; below to generate.
                        </p>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground space-y-3">
                  <AlertCircle className="h-10 w-10 text-muted-foreground/80" />
                  <p className="text-sm font-bold text-foreground">Awaiting Resume Upload</p>
                  <p className="text-xs max-w-sm">
                    Once you upload your resume file in the Resume panel, our Groq AI engine will list target keywords and outline improvements.
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter className="border-t border-border/50 bg-muted/5 px-6 py-4 flex justify-end">
              <Link href="/dashboard/resumes">
                <Button size="sm" className="rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer">
                  <span>Manage Resume File</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}
