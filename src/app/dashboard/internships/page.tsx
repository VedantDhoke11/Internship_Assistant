'use client';

import * as React from 'react';
import {
  Search,
  SlidersHorizontal,
  Briefcase,
  MapPin,
  DollarSign,
  ExternalLink,
  Bookmark,
  Calendar,
  X,
  Sparkles,
  Building2,
  CheckCircle2,
  ArrowRight,
  Loader2,

} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { JobListing } from '@/services/jobs/types';

// ============================================================================
// ============================================================================
// PORTAL LINK GENERATORS
// Each URL includes both the specific job TITLE and COMPANY so the user
// lands on that exact opportunity when they click the platform button.
// ============================================================================



// ============================================================================
// Source badge colors
// ============================================================================

const SOURCE_COLORS = {
  linkedin: {
    bar: 'bg-blue-600',
    badge: 'bg-blue-600/10 text-blue-500 border-blue-600/25 hover:bg-blue-600/20',
    icon: '🔗',
    label: 'LinkedIn',
  },
  internshala: {
    bar: 'bg-orange-500',
    badge: 'bg-orange-500/10 text-orange-500 border-orange-500/25 hover:bg-orange-500/20',
    icon: '📋',
    label: 'Internshala',
  },
  unstop: {
    bar: 'bg-purple-600',
    badge: 'bg-purple-600/10 text-purple-500 border-purple-600/25 hover:bg-purple-600/20',
    icon: '🏆',
    label: 'Unstop',
  },
} as const;

export default function InternshipFeedPage() {
  // State variables
  const [listings, setListings] = React.useState<JobListing[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedSource, setSelectedSource] = React.useState<'all' | 'linkedin' | 'internshala' | 'unstop'>('all');
  const [selectedCategory, setSelectedCategory] = React.useState('all');
  const [selectedType, setSelectedType] = React.useState('all');
  const [page, setPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(true);
  const [isFetchingMore, setIsFetchingMore] = React.useState(false);
  
  // Active selection for details drawer
  const [selectedJob, setSelectedJob] = React.useState<JobListing | null>(null);
  
  // Session User Info
  const [userEmail, setUserEmail] = React.useState<string | null>(null);
  
  // Saved / Applied states synced from DB
  const [savedJobLinks, setSavedJobLinks] = React.useState<Set<string>>(new Set());
  const [appliedJobLinks, setAppliedJobLinks] = React.useState<Set<string>>(new Set());
  const [actionInProgress, setActionInProgress] = React.useState<Record<string, boolean>>({});

  // Toast status
  const [toast, setToast] = React.useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Load user session
  React.useEffect(() => {
    const loadUser = () => {
      try {
        const stored = window.sessionStorage.getItem('user');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.email) {
            setUserEmail(parsed.email);
          }
        }
      } catch {
        // Safe SSR check
      }
    };
    const handle = setTimeout(loadUser, 0);
    return () => clearTimeout(handle);
  }, []);

  // Fetch bookmarks & applications when userEmail is resolved
  const fetchUserApplications = React.useCallback(async () => {
    if (!userEmail) return;
    try {
      const response = await fetch(`/api/applications?email=${encodeURIComponent(userEmail)}`);
      if (response.ok) {
        const data = await response.json();
        const saved = new Set<string>();
        const applied = new Set<string>();
        
        data.applications.forEach((app: { status: string; internship: { applyLink: string } }) => {
          if (app.status === 'Saved') {
            saved.add(app.internship.applyLink);
          } else if (app.status === 'Applied') {
            applied.add(app.internship.applyLink);
          }
        });
        
        setSavedJobLinks(saved);
        setAppliedJobLinks(applied);
      }
    } catch (e) {
      console.error('Error fetching applications:', e);
    }
  }, [userEmail]);

  React.useEffect(() => {
    if (userEmail) {
      const handle = setTimeout(() => {
        fetchUserApplications();
      }, 0);
      return () => clearTimeout(handle);
    }
  }, [userEmail, fetchUserApplications]);

  // Fetch job listings matching source, search, and filters
  const fetchListings = React.useCallback(async (pageNum: number = 1, append: boolean = false) => {
    if (pageNum === 1) {
      setIsLoading(true);
    } else {
      setIsFetchingMore(true);
    }
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.append('q', searchQuery.trim());
      if (selectedSource !== 'all') params.append('source', selectedSource);
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (selectedType !== 'all') params.append('type', selectedType);
      params.append('page', pageNum.toString());

      const response = await fetch(`/api/internships?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        const newListings = data.listings || [];
        if (append) {
          setListings((prev) => [...prev, ...newListings]);
        } else {
          setListings(newListings);
        }
        setHasMore(newListings.length >= 10);
      }
    } catch (e) {
      console.error('Error loading listings:', e);
    } finally {
      setIsLoading(false);
      setIsFetchingMore(false);
    }
  }, [searchQuery, selectedSource, selectedCategory, selectedType]);

  // Refetch listings on filter change
  React.useEffect(() => {
    setPage(1);
    const delayDebounce = setTimeout(() => {
      fetchListings(1, false);
    }, 300); // debounce API calls for search
    return () => clearTimeout(delayDebounce);
  }, [searchQuery, selectedSource, selectedCategory, selectedType, fetchListings]);

  const loadNextPage = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchListings(nextPage, true);
  };

  // Show Toast Helper
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Perform Bookmark/Save or Apply operation
  const handleTrackingAction = async (job: JobListing, status: 'Saved' | 'Applied') => {
    if (!userEmail) {
      showToast('Please sign in to bookmark or apply to internships.', 'error');
      return;
    }

    setActionInProgress((prev) => ({ ...prev, [job.id]: true }));
    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail,
          internship: {
            title: job.title,
            company: job.company,
            description: job.description,
            source: job.source,
            skillsRequired: job.skillsRequired,
            stipend: job.stipend,
            applyLink: job.applyLink,
          },
          status,
        }),
      });

      if (response.ok) {
        showToast(
          status === 'Saved' 
            ? `Bookmarked "${job.title}" at ${job.company}!`
            : `Application logged for "${job.title}"!`
        );
        fetchUserApplications(); // Sync with DB state
      } else {
        showToast('Failed to log application status. Please try again.', 'error');
      }
    } catch (e) {
      console.error(e);
      showToast('Connection error. Please check your network.', 'error');
    } finally {
      setActionInProgress((prev) => ({ ...prev, [job.id]: false }));
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-300 relative pb-12">
      {/* Toast Notification Container */}
      {toast && (
        <div className={cn(
          "fixed bottom-5 right-5 z-50 p-4 rounded-xl shadow-xl flex items-center gap-3 border transition-all animate-in slide-in-from-bottom-5 duration-300",
          toast.type === 'success' 
            ? 'bg-card border-green-500/30 text-foreground' 
            : 'bg-destructive/10 border-destructive/30 text-destructive'
        )}>
          <CheckCircle2 className={cn("h-5 w-5", toast.type === 'success' ? 'text-green-500' : 'text-destructive')} />
          <span className="text-sm font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
            <Briefcase className="h-8 w-8 text-primary" />
            <span>Internship Feed</span>
          </h1>
          <p className="text-muted-foreground mt-1.5 max-w-2xl">
            Real-time internships aggregated from live job boards. Click <strong>Apply Now</strong> to go directly to the job application, or use the platform buttons to search for this exact role on LinkedIn, Internshala &amp; Unstop.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-xs font-semibold text-primary self-start">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Live Aggregator</span>
        </div>
      </div>

      {/* Main Search and Filters Bar */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-4 items-center bg-card/30 backdrop-blur-md p-4 rounded-2xl border border-border">
        {/* Search Input */}
        <div className="lg:col-span-2 relative">
          <Search className="absolute left-3.5 top-2.5 h-4.5 w-4.5 text-muted-foreground" />
          <Input
            placeholder="Search roles, skills, or companies (e.g. React, Python, Google)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-xl bg-background/50 border-border/80 focus-visible:ring-1 focus-visible:ring-primary"
          />
        </div>

        {/* Category Filter */}
        <div className="relative">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-background/50 border border-border/80 rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary appearance-none cursor-pointer"
            aria-label="Filter by Category"
          >
            <option value="all">All Categories</option>
            <option value="Software Development">Software Development</option>
            <option value="Data Science & Analytics">Data Science &amp; Analytics</option>
            <option value="Product Management">Product Management</option>
            <option value="Design & Creative">Design &amp; Creative</option>
            <option value="Marketing">Marketing</option>
            <option value="Business Development">Business Development</option>
          </select>
          <SlidersHorizontal className="absolute right-3.5 top-3 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
        </div>

        {/* Location Type Filter */}
        <div className="relative">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full bg-background/50 border border-border/80 rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary appearance-none cursor-pointer"
            aria-label="Filter by Job Type"
          >
            <option value="all">All Job Types</option>
            <option value="Remote">Remote</option>
            <option value="Hybrid">Hybrid</option>
            <option value="On-site">On-site</option>
          </select>
          <MapPin className="absolute right-3.5 top-3 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      {/* Platform Source Tabs */}
      <div className="flex border-b border-border/60 pb-px gap-2 overflow-x-auto">
        {(['all', 'linkedin', 'internshala', 'unstop'] as const).map((source) => {
          const isActive = selectedSource === source;
          return (
            <button
              key={source}
              onClick={() => setSelectedSource(source)}
              className={cn(
                "px-5 py-2.5 text-sm font-semibold rounded-t-xl transition-all relative whitespace-nowrap cursor-pointer",
                isActive 
                  ? "text-primary border-b-2 border-primary bg-primary/5" 
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/40"
              )}
            >
              <span className="capitalize">{source === 'all' ? 'All Platforms' : source}</span>
            </button>
          );
        })}
      </div>

      {/* Listings Grid / Container */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, idx) => (
            <Card key={idx} className="rounded-2xl border border-border bg-card/40 backdrop-blur-md h-64 flex flex-col justify-between animate-pulse">
              <CardHeader className="space-y-2">
                <div className="h-4 bg-muted rounded w-1/3" />
                <div className="h-6 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-muted rounded w-full mb-2" />
                <div className="h-4 bg-muted rounded w-5/6" />
              </CardContent>
              <CardFooter className="flex justify-between border-t border-border/50 pt-4">
                <div className="h-9 bg-muted rounded w-1/3" />
                <div className="h-9 bg-muted rounded w-1/3" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : listings.length === 0 ? (
        <Card className="rounded-2xl border border-dashed border-border bg-card/20 p-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/80 text-muted-foreground mx-auto mb-4">
            <Search className="h-6 w-6" />
          </div>
          <CardTitle className="text-lg">No internships found</CardTitle>
          <CardDescription className="max-w-md mx-auto mt-2">
            We couldn&apos;t find any listings matching your active filters. Try adjustments to your search queries or category filters.
          </CardDescription>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {listings.map((job) => {
            const isSaved = savedJobLinks.has(job.applyLink);
            const isApplied = appliedJobLinks.has(job.applyLink);
            const isWorking = actionInProgress[job.id] || false;
            const colors = SOURCE_COLORS[job.source];

            
            return (
              <Card 
                key={job.id} 
                className="group rounded-2xl border border-border bg-card/30 hover:bg-card/50 hover:border-border/80 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden"
              >
                {/* Visual Header / Brand Indicator */}
                <div className={cn("h-1.5 w-full", colors.bar)} />

                <CardHeader className="space-y-1.5 pb-3">
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        "text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full border flex items-center gap-1",
                        colors.badge
                      )}
                    >
                      <span>{colors.label}</span>
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(job.postedAt).toLocaleDateString()}</span>
                    </span>
                  </div>
                  
                  <div>
                    <CardTitle className="text-base font-bold text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-1">
                      {job.title}
                    </CardTitle>
                    <p className="text-sm font-semibold text-muted-foreground flex items-center gap-1.5 mt-0.5">
                      <Building2 className="h-3.5 w-3.5" />
                      <span>{job.company}</span>
                    </p>
                  </div>
                </CardHeader>

                <CardContent className="pb-4 flex-1 space-y-3">
                  <p className="text-xs text-muted-foreground/90 line-clamp-2 leading-relaxed">
                    {job.description}
                  </p>
                  
                  {/* Meta items */}
                  <div className="flex flex-wrap gap-2.5 text-xs">
                    <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-muted/50 border border-border/40 text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>{job.location} ({job.type})</span>
                    </div>
                    {job.stipend && (
                      <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-muted/50 border border-border/40 text-muted-foreground">
                        <DollarSign className="h-3 w-3" />
                        <span>{job.stipend}</span>
                      </div>
                    )}
                  </div>

                  {/* Skills tags */}
                  <div className="flex flex-wrap gap-1 pt-1.5">
                    {job.skillsRequired.slice(0, 3).map((skill) => (
                      <span key={skill} className="text-[10px] bg-accent/50 text-accent-foreground px-2 py-0.5 rounded font-medium">
                        {skill}
                      </span>
                    ))}
                    {job.skillsRequired.length > 3 && (
                      <span className="text-[10px] text-muted-foreground px-1.5 py-0.5">
                        +{job.skillsRequired.length - 3} more
                      </span>
                    )}
                  </div>

                  {/* Single button for the source platform that originally posted this job */}
                  <div className="pt-2">
                    <a
                      href={job.applyLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => { e.preventDefault(); window.open(job.applyLink, '_blank'); }}
                      className={cn(
                        "w-full inline-flex items-center justify-center gap-2 text-xs font-bold px-3 py-2.5 rounded-lg border hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer",
                        job.source === 'linkedin' && "bg-blue-600/10 text-blue-500 border-blue-500/25 hover:bg-blue-600/20",
                        job.source === 'internshala' && "bg-orange-500/10 text-orange-500 border-orange-500/25 hover:bg-orange-500/20",
                        job.source === 'unstop' && "bg-purple-600/10 text-purple-500 border-purple-500/25 hover:bg-purple-600/20"
                      )}
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      View on {colors.label}
                    </a>
                  </div>
                </CardContent>

                <CardFooter className="border-t border-border/50 bg-muted/5 px-6 py-4 flex gap-2 justify-between">
                  <Button
                    onClick={() => setSelectedJob(job)}
                    variant="ghost"
                    size="sm"
                    className="rounded-xl flex-1 text-xs font-semibold hover:bg-accent/80 cursor-pointer"
                  >
                    View Details
                  </Button>

                  {/* Bookmark Button */}
                  <Button
                    onClick={() => handleTrackingAction(job, 'Saved')}
                    disabled={isWorking || isSaved || isApplied}
                    variant="outline"
                    size="sm"
                    className={cn(
                      "rounded-xl border-border px-3 shrink-0 flex items-center justify-center cursor-pointer",
                      isSaved && "bg-primary/10 border-primary/30 text-primary hover:bg-primary/10",
                      isApplied && "bg-green-500/10 border-green-500/30 text-green-500 hover:bg-green-500/10"
                    )}
                    aria-label="Bookmark this internship"
                  >
                    {isWorking ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : isApplied ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <Bookmark className={cn("h-4 w-4", isSaved && "fill-current")} />
                    )}
                  </Button>

                  {/* Apply Action — links to actual job application page */}
                  <Button
                    onClick={() => {
                      handleTrackingAction(job, 'Applied');
                      window.open(job.applyLink, '_blank');
                    }}
                    disabled={isWorking}
                    size="sm"
                    className="rounded-xl flex-1 text-xs font-bold flex items-center gap-1 shadow-sm cursor-pointer"
                  >
                    <span>{isApplied ? 'Apply Again' : 'Apply Now'}</span>
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination Load More Button */}
      {listings.length > 0 && hasMore && (
        <div className="flex justify-center pt-8">
          <Button
            onClick={loadNextPage}
            disabled={isFetchingMore}
            variant="outline"
            className="rounded-xl px-8 py-2.5 font-semibold cursor-pointer shadow-sm flex items-center gap-2 hover:bg-accent/80 transition-all duration-200"
          >
            {isFetchingMore ? (
              <>
                <Loader2 className="h-4.5 w-4.5 animate-spin" />
                <span>Loading more...</span>
              </>
            ) : (
              <span>Load More Opportunities</span>
            )}
          </Button>
        </div>
      )}

      {/* Details Side Drawer Component */}
      {selectedJob && (
        <>
          {/* Overlay background */}
          <div 
            onClick={() => setSelectedJob(null)}
            className="fixed inset-0 bg-background/60 backdrop-blur-sm z-50 animate-in fade-in-0 duration-200"
          />

          {/* Sliding sheet container */}
          <div className="fixed top-0 right-0 h-full w-full max-w-xl bg-card border-l border-border backdrop-blur-lg shadow-2xl z-50 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="p-6 border-b border-border/80 flex items-start justify-between">
              <div className="space-y-1">
                <span
                  className={cn(
                    "text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full border inline-flex items-center gap-1",
                    SOURCE_COLORS[selectedJob.source].badge
                  )}
                >
                  <span>{SOURCE_COLORS[selectedJob.source].label}</span>
                </span>
                <h2 className="text-xl font-extrabold text-foreground tracking-tight mt-2">
                  {selectedJob.title}
                </h2>
                <p className="text-sm font-semibold text-muted-foreground flex items-center gap-1.5 mt-0.5">
                  <Building2 className="h-4 w-4" />
                  <span>{selectedJob.company}</span>
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedJob(null)}
                className="rounded-full h-8 w-8 hover:bg-accent/80 cursor-pointer"
                aria-label="Close details"
              >
                <X className="h-4.5 w-4.5" />
              </Button>
            </div>

            {/* Drawer Body / Scrollable Content */}
            <div className="flex-1 p-6 space-y-6">
              {/* Job Metadata Panels */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl border border-border bg-muted/10 space-y-1">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>Location</span>
                  </span>
                  <p className="text-sm font-bold text-foreground">{selectedJob.location}</p>
                  <p className="text-[10px] text-muted-foreground font-medium">{selectedJob.type} structure</p>
                </div>
                <div className="p-3.5 rounded-xl border border-border bg-muted/10 space-y-1">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    <span>Stipend Offer</span>
                  </span>
                  <p className="text-sm font-bold text-foreground">{selectedJob.stipend || 'Unspecified'}</p>
                  <p className="text-[10px] text-muted-foreground font-medium">Platform recorded rate</p>
                </div>
              </div>

              {/* Required Skills Panel */}
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Required Skills</h3>
                <div className="flex flex-wrap gap-1.5">
                  {selectedJob.skillsRequired.map((skill) => (
                    <span 
                      key={skill} 
                      className="text-xs bg-primary/5 text-primary border border-primary/10 px-3 py-1 rounded-lg font-semibold"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Description Panel */}
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Job Description</h3>
                <div className="p-4 rounded-xl border border-border/80 bg-muted/5 leading-relaxed text-sm text-foreground/90 whitespace-pre-line space-y-3">
                  <p>{selectedJob.description}</p>
                </div>
              </div>

              {/* Single button — only the source platform */}
              {(() => {
                const drawerColors = SOURCE_COLORS[selectedJob.source];
                return (
                  <button
                    type="button"
                    onClick={() => window.open(selectedJob.applyLink, '_blank')}
                    className={cn(
                      "w-full flex items-center justify-center gap-3 p-4 rounded-xl border-2 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer",
                      selectedJob.source === 'linkedin' && "border-blue-500/30 bg-blue-600/5 hover:bg-blue-600/15",
                      selectedJob.source === 'internshala' && "border-orange-500/30 bg-orange-500/5 hover:bg-orange-500/15",
                      selectedJob.source === 'unstop' && "border-purple-500/30 bg-purple-600/5 hover:bg-purple-600/15"
                    )}
                  >
                    <ExternalLink className={cn(
                      "h-5 w-5",
                      selectedJob.source === 'linkedin' && "text-blue-500",
                      selectedJob.source === 'internshala' && "text-orange-500",
                      selectedJob.source === 'unstop' && "text-purple-500"
                    )} />
                    <span className={cn(
                      "text-sm font-bold",
                      selectedJob.source === 'linkedin' && "text-blue-500",
                      selectedJob.source === 'internshala' && "text-orange-500",
                      selectedJob.source === 'unstop' && "text-purple-500"
                    )}>
                      View on {drawerColors.label}
                    </span>
                  </button>
                );
              })()}

              {/* Quick Advisory Insight Hint */}
              <div className="rounded-xl bg-primary/5 border border-primary/10 p-4 flex gap-3 text-xs leading-normal">
                <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold text-primary">AI Copilot Recommendation</span>
                  <p className="text-muted-foreground">
                    Based on your details, this role requires skills in <span className="font-semibold text-foreground">{selectedJob.skillsRequired.slice(0, 2).join(' & ')}</span>. Use the Resume Intelligence panel to optimize your profile before applying.
                  </p>
                </div>
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-6 border-t border-border bg-muted/10 flex gap-3">
              {/* Bookmark Toggle */}
              <Button
                onClick={() => handleTrackingAction(selectedJob, 'Saved')}
                disabled={actionInProgress[selectedJob.id] || savedJobLinks.has(selectedJob.applyLink) || appliedJobLinks.has(selectedJob.applyLink)}
                variant="outline"
                className={cn(
                  "rounded-xl flex-1 py-5 font-bold flex items-center justify-center gap-2 cursor-pointer",
                  savedJobLinks.has(selectedJob.applyLink) && "bg-primary/10 border-primary/30 text-primary hover:bg-primary/10",
                  appliedJobLinks.has(selectedJob.applyLink) && "bg-green-500/10 border-green-500/30 text-green-500 hover:bg-green-500/10"
                )}
              >
                {actionInProgress[selectedJob.id] ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : appliedJobLinks.has(selectedJob.applyLink) ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Applied & Logged</span>
                  </>
                ) : savedJobLinks.has(selectedJob.applyLink) ? (
                  <>
                    <Bookmark className="h-4 w-4 fill-current" />
                    <span>Bookmarked</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="h-4 w-4" />
                    <span>Bookmark Position</span>
                  </>
                )}
              </Button>

              {/* Direct Apply Button — opens the actual job application page */}
              <Button
                onClick={() => {
                  handleTrackingAction(selectedJob, 'Applied');
                  window.open(selectedJob.applyLink, '_blank');
                }}
                disabled={actionInProgress[selectedJob.id]}
                className="rounded-xl flex-1 py-5 font-bold shadow-md shadow-primary/10 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Quick Apply Now</span>
                <ArrowRight className="h-4.5 w-4.5" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
