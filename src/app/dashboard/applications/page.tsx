'use client';

import * as React from 'react';
import {
  KanbanSquare,
  Plus,
  Search,
  SlidersHorizontal,
  MapPin,
  DollarSign,
  Calendar,
  X,
  Building2,
  CheckCircle2,
  Trash2,
  FileText,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

// Define structures matching database schema
interface Internship {
  id: string;
  title: string;
  company: string;
  description: string;
  source: string;
  skillsRequired: string[];
  stipend?: string;
  applyLink: string;
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

// Kanban Columns config
const COLUMNS = [
  { id: 'Saved', title: 'Saved', color: 'border-muted-foreground/30 bg-muted-foreground/5 text-muted-foreground' },
  { id: 'Applied', title: 'Applied', color: 'border-blue-500/30 bg-blue-500/5 text-blue-500' },
  { id: 'OA', title: 'Assessment (OA)', color: 'border-indigo-500/30 bg-indigo-500/5 text-indigo-500' },
  { id: 'Interview', title: 'Interviewing', color: 'border-amber-500/30 bg-amber-500/5 text-amber-500' },
  { id: 'Offer', title: 'Offers Secured 🎉', color: 'border-green-500/30 bg-green-500/5 text-green-500' },
  { id: 'Rejected', title: 'Rejected', color: 'border-destructive/30 bg-destructive/5 text-destructive' },
] as const;

type ColumnStatus = typeof COLUMNS[number]['id'];

export default function ApplicationTrackerPage() {
  // State variables
  const [applications, setApplications] = React.useState<Application[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedSource, setSelectedSource] = React.useState('all');
  
  // Modals state
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [selectedApp, setSelectedApp] = React.useState<Application | null>(null);
  const [actionInProgress, setActionInProgress] = React.useState<string | null>(null);
  
  // Form states (Add Manual Application)
  const [newTitle, setNewTitle] = React.useState('');
  const [newCompany, setNewCompany] = React.useState('');
  const [newDescription, setNewDescription] = React.useState('');
  const [newSource, setNewSource] = React.useState('manual');
  const [newSkills, setNewSkills] = React.useState('');
  const [newStipend, setNewStipend] = React.useState('');
  const [newApplyLink, setNewApplyLink] = React.useState('');
  const [newStatus, setNewStatus] = React.useState<ColumnStatus>('Saved');
  const [newNotes, setNewNotes] = React.useState('');

  // Form states (Edit Existing Application)
  const [editNotes, setEditNotes] = React.useState('');
  const [editResume, setEditResume] = React.useState('');
  const [editStatus, setEditStatus] = React.useState<ColumnStatus>('Saved');

  // User session
  const [userEmail, setUserEmail] = React.useState<string | null>(null);
  const [toast, setToast] = React.useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Toast notifier helper (Hoisted to top for callback reference)
  const showToast = React.useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Load user session (Deferred to avoid cascading renders)
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

  // Fetch applications
  const fetchApplications = React.useCallback(async () => {
    if (!userEmail) return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/applications?email=${encodeURIComponent(userEmail)}`);
      if (response.ok) {
        const data = await response.json();
        setApplications(data.applications || []);
      }
    } catch (e) {
      console.error('Error fetching applications:', e);
      showToast('Failed to load application data.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [userEmail, showToast]);

  // Fetch trigger (Deferred to avoid cascading renders)
  React.useEffect(() => {
    if (userEmail) {
      const handle = setTimeout(() => {
        fetchApplications();
      }, 0);
      return () => clearTimeout(handle);
    }
  }, [userEmail, fetchApplications]);

  // Filtered applications computed during render (No useEffect needed)
  const filteredApps = React.useMemo(() => {
    let filtered = applications;

    if (searchQuery.trim()) {
      const normQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (app) =>
          app.internship.title.toLowerCase().includes(normQuery) ||
          app.internship.company.toLowerCase().includes(normQuery) ||
          app.internship.skillsRequired.some((s) => s.toLowerCase().includes(normQuery))
      );
    }

    if (selectedSource !== 'all') {
      filtered = filtered.filter((app) => app.internship.source === selectedSource);
    }

    return filtered;
  }, [searchQuery, selectedSource, applications]);

  // Sync edit modal fields when selected app changes (Deferred)
  React.useEffect(() => {
    if (selectedApp) {
      const handle = setTimeout(() => {
        setEditNotes(selectedApp.notes || '');
        setEditResume(selectedApp.resumeUsed || '');
        setEditStatus(selectedApp.status as ColumnStatus);
      }, 0);
      return () => clearTimeout(handle);
    }
  }, [selectedApp]);

  // Create Manual Application handler
  const handleAddManualApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userEmail) return;

    if (!newTitle.trim() || !newCompany.trim()) {
      showToast('Title and Company are required.', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const skillsArray = newSkills
        ? newSkills.split(',').map((s) => s.trim()).filter((s) => s.length > 0)
        : [];

      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail,
          internship: {
            title: newTitle.trim(),
            company: newCompany.trim(),
            description: newDescription.trim(),
            source: newSource,
            skillsRequired: skillsArray,
            stipend: newStipend.trim(),
            applyLink: newApplyLink.trim(),
          },
          status: newStatus,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // If notes are supplied, run an immediate PATCH since notes are logged in Application, not Internship
        if (newNotes.trim() && data.application?.id) {
          await fetch('/api/applications', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              applicationId: data.application.id,
              notes: newNotes.trim(),
            }),
          });
        }

        showToast(`Manual entry logged for ${newCompany}!`);
        setIsAddOpen(false);
        // Clear fields
        setNewTitle('');
        setNewCompany('');
        setNewDescription('');
        setNewSource('manual');
        setNewSkills('');
        setNewStipend('');
        setNewApplyLink('');
        setNewStatus('Saved');
        setNewNotes('');

        fetchApplications();
      } else {
        showToast('Failed to create manual tracking log.', 'error');
      }
    } catch (e) {
      console.error(e);
      showToast('Network error, failed to submit.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Update card status / notes / resume
  const handleUpdateApp = async (appId: string, updates: { status?: ColumnStatus; notes?: string; resumeUsed?: string }) => {
    setActionInProgress(appId);
    try {
      const response = await fetch('/api/applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: appId,
          ...updates,
        }),
      });

      if (response.ok) {
        showToast('Application updated successfully.');
        fetchApplications();
        // Close modal if open
        if (selectedApp && selectedApp.id === appId) {
          setSelectedApp(null);
        }
      } else {
        showToast('Failed to update application details.', 'error');
      }
    } catch (e) {
      console.error(e);
      showToast('Connection error.', 'error');
    } finally {
      setActionInProgress(null);
    }
  };

  // Delete card from board
  const handleDeleteApp = async (appId: string) => {
    if (!confirm('Are you sure you want to remove this internship application from your board? This cannot be undone.')) {
      return;
    }
    setActionInProgress(appId);
    try {
      const response = await fetch(`/api/applications?id=${encodeURIComponent(appId)}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        showToast('Application removed from tracker.');
        setSelectedApp(null);
        fetchApplications();
      } else {
        showToast('Failed to delete application.', 'error');
      }
    } catch (e) {
      console.error(e);
      showToast('Connection error.', 'error');
    } finally {
      setActionInProgress(null);
    }
  };

  // Direct HTML5 Drag & Drop handlers
  const handleDragStart = (e: React.DragEvent, appId: string) => {
    e.dataTransfer.setData('text/plain', appId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: ColumnStatus) => {
    e.preventDefault();
    const appId = e.dataTransfer.getData('text/plain');
    if (!appId) return;

    // Verify if it actually changed status
    const app = applications.find((a) => a.id === appId);
    if (app && app.status !== targetStatus) {
      handleUpdateApp(appId, { status: targetStatus });
    }
  };

  // Move Column Helpers for Mobile/Arrows
  const handleShiftStage = (app: Application, direction: 'left' | 'right') => {
    const currentIndex = COLUMNS.findIndex((c) => c.id === app.status);
    if (currentIndex === -1) return;

    const nextIndex = direction === 'right' ? currentIndex + 1 : currentIndex - 1;
    if (nextIndex >= 0 && nextIndex < COLUMNS.length) {
      handleUpdateApp(app.id, { status: COLUMNS[nextIndex].id });
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
            <KanbanSquare className="h-8 w-8 text-primary" />
            <span>Application Tracker</span>
          </h1>
          <p className="text-muted-foreground mt-1.5 max-w-2xl">
            Track your recruitment pipelines in a responsive Kanban workspace. Drag cards to update statuses or log manual applications.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => setIsAddOpen(true)}
            className="rounded-xl font-bold flex items-center gap-1.5 shadow-sm shadow-primary/10 cursor-pointer"
          >
            <Plus className="h-4.5 w-4.5" />
            <span>Add Application</span>
          </Button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center bg-card/30 backdrop-blur-md p-4 rounded-2xl border border-border">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-2.5 h-4.5 w-4.5 text-muted-foreground" />
          <Input
            placeholder="Search active applications by company, title, or skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-xl bg-background/50 border-border/80 focus-visible:ring-1 focus-visible:ring-primary"
          />
        </div>

        {/* Platform Source Filter */}
        <div className="relative w-full sm:w-60">
          <select
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
            className="w-full bg-background/50 border border-border/80 rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary appearance-none cursor-pointer"
            aria-label="Filter by Job Board Source"
          >
            <option value="all">All Sources</option>
            <option value="linkedin">LinkedIn</option>
            <option value="internshala">Internshala</option>
            <option value="unstop">Unstop</option>
            <option value="manual">Manual Log</option>
          </select>
          <SlidersHorizontal className="absolute right-3.5 top-3 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      {/* Kanban Board Container */}
      {isLoading && applications.length === 0 ? (
        <div className="flex h-96 items-center justify-center">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </div>
      ) : (
        <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-thin select-none snap-x snap-mandatory">
          {COLUMNS.map((col) => {
            const colApps = filteredApps.filter((a) => a.status === col.id);
            
            return (
              <div
                key={col.id}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, col.id)}
                className="w-80 shrink-0 flex flex-col snap-start"
              >
                {/* Column Title and Indicator Header */}
                <div className={cn("flex items-center justify-between px-3 py-2 border-b-2 rounded-t-xl mb-4 font-semibold text-sm", col.color)}>
                  <span>{col.title}</span>
                  <span className="bg-background/80 border border-border/20 px-2 py-0.5 rounded-md text-xs font-bold shadow-sm">
                    {colApps.length}
                  </span>
                </div>

                {/* Column Body / Card List */}
                <div className="flex-1 min-h-[500px] bg-muted/10 border border-dashed border-border/60 rounded-xl p-3 space-y-4 overflow-y-auto">
                  {colApps.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-center p-6 text-xs text-muted-foreground leading-relaxed border border-dashed border-border/20 rounded-xl bg-card/5 select-none">
                      Drag here or click quick actions to update
                    </div>
                  ) : (
                    colApps.map((app) => {
                      const isWorking = actionInProgress === app.id;
                      
                      return (
                        <div
                          key={app.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, app.id)}
                          onClick={() => setSelectedApp(app)}
                          className={cn(
                            "group relative rounded-xl border border-border bg-card/60 backdrop-blur-md p-4 cursor-grab hover:bg-card hover:border-primary/40 hover:shadow-md transition-all duration-300 space-y-3.5",
                            isWorking && "opacity-50 pointer-events-none"
                          )}
                        >
                          {/* Platform Color Tag */}
                          <div className={cn(
                            "absolute left-0 top-0 bottom-0 w-1 rounded-l-xl",
                            app.internship.source === 'linkedin' && "bg-blue-600",
                            app.internship.source === 'internshala' && "bg-orange-500",
                            app.internship.source === 'unstop' && "bg-purple-600",
                            app.internship.source === 'manual' && "bg-muted-foreground"
                          )} />

                          {/* Header / Company & Source Badge */}
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider line-clamp-1 flex items-center gap-1">
                              <Building2 className="h-3 w-3" />
                              <span>{app.internship.company}</span>
                            </span>
                            <span className={cn(
                              "text-[8px] font-bold px-1.5 py-0.5 rounded-full border shrink-0 uppercase",
                              app.internship.source === 'linkedin' && "bg-blue-600/10 text-blue-600 border-blue-600/20",
                              app.internship.source === 'internshala' && "bg-orange-500/10 text-orange-600 border-orange-500/20",
                              app.internship.source === 'unstop' && "bg-purple-600/10 text-purple-600 border-purple-600/20",
                              app.internship.source === 'manual' && "bg-muted/10 text-muted-foreground border-border"
                            )}>
                              {app.internship.source}
                            </span>
                          </div>

                          {/* Card Title */}
                          <h4 className="text-sm font-bold text-foreground leading-snug line-clamp-2">
                            {app.internship.title}
                          </h4>

                          {/* Indicators Footer (Notes / Resume badge) */}
                          <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/40">
                            <div className="flex items-center gap-2">
                              {app.notes && (
                                <span className="flex items-center gap-0.5" title="Has Notes">
                                  <MessageSquare className="h-3 w-3 text-primary" />
                                </span>
                              )}
                              {app.resumeUsed && (
                                <span className="flex items-center gap-0.5 bg-primary/5 text-primary border border-primary/15 px-1.5 py-0.5 rounded" title={app.resumeUsed}>
                                  <FileText className="h-2.5 w-2.5" />
                                  <span className="font-semibold line-clamp-1 max-w-[80px] text-[8px]">{app.resumeUsed}</span>
                                </span>
                              )}
                            </div>
                            <span className="flex items-center gap-0.5 text-[9px]">
                              <Calendar className="h-2.5 w-2.5" />
                              <span>{new Date(app.updatedAt).toLocaleDateString()}</span>
                            </span>
                          </div>

                          {/* Accessibility arrow movements (Quick mobile transition controls) */}
                          <div className="absolute right-2 top-2 hidden group-hover:flex items-center gap-0.5 bg-background border border-border/80 rounded-lg p-0.5 shadow-sm">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleShiftStage(app, 'left');
                              }}
                              className="p-1 text-muted-foreground hover:text-foreground hover:bg-accent rounded cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                              disabled={col.id === COLUMNS[0].id}
                              aria-label="Move stage left"
                            >
                              <ChevronLeft className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleShiftStage(app, 'right');
                              }}
                              className="p-1 text-muted-foreground hover:text-foreground hover:bg-accent rounded cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                              disabled={col.id === COLUMNS[COLUMNS.length - 1].id}
                              aria-label="Move stage right"
                            >
                              <ChevronRight className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: Add Manual Application */}
      {isAddOpen && (
        <>
          {/* Backdrop overlay */}
          <div 
            onClick={() => setIsAddOpen(false)}
            className="fixed inset-0 bg-background/60 backdrop-blur-sm z-50 animate-in fade-in-0 duration-200"
          />

          {/* Dialog Container */}
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-card border border-border p-6 rounded-2xl shadow-2xl z-50 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-border/80 mb-5">
              <h2 className="text-xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
                <Plus className="h-5 w-5 text-primary" />
                <span>Add Application Log</span>
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsAddOpen(false)}
                className="rounded-full h-8 w-8 hover:bg-accent/80 cursor-pointer"
                aria-label="Close dialog"
              >
                <X className="h-4.5 w-4.5" />
              </Button>
            </div>

            <form onSubmit={handleAddManualApp} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Title */}
                <div className="space-y-1.5">
                  <label htmlFor="manual-title" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Job Title *
                  </label>
                  <Input
                    id="manual-title"
                    placeholder="e.g. Frontend Developer"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    required
                    className="rounded-xl"
                  />
                </div>

                {/* Company */}
                <div className="space-y-1.5">
                  <label htmlFor="manual-company" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Company Name *
                  </label>
                  <Input
                    id="manual-company"
                    placeholder="e.g. Vercel"
                    value={newCompany}
                    onChange={(e) => setNewCompany(e.target.value)}
                    required
                    className="rounded-xl"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label htmlFor="manual-desc" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Description / Brief Details
                </label>
                <textarea
                  id="manual-desc"
                  placeholder="Paste vacancy requirements or details here..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full min-h-[80px] bg-background border border-border rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Source Selection */}
                <div className="space-y-1.5">
                  <label htmlFor="manual-source" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Source Platform
                  </label>
                  <select
                    id="manual-source"
                    value={newSource}
                    onChange={(e) => setNewSource(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary appearance-none cursor-pointer"
                  >
                    <option value="manual">Manual Entry</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="internshala">Internshala</option>
                    <option value="unstop">Unstop</option>
                  </select>
                </div>

                {/* Stipend */}
                <div className="space-y-1.5">
                  <label htmlFor="manual-stipend" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Stipend Offer
                  </label>
                  <Input
                    id="manual-stipend"
                    placeholder="e.g. ₹35,000 / month"
                    value={newStipend}
                    onChange={(e) => setNewStipend(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Apply link */}
                <div className="space-y-1.5">
                  <label htmlFor="manual-applylink" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Apply Link / URL
                  </label>
                  <Input
                    id="manual-applylink"
                    type="url"
                    placeholder="https://company.com/apply"
                    value={newApplyLink}
                    onChange={(e) => setNewApplyLink(e.target.value)}
                    className="rounded-xl"
                  />
                </div>

                {/* Initial Stage */}
                <div className="space-y-1.5">
                  <label htmlFor="manual-stage" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Initial Stage
                  </label>
                  <select
                    id="manual-stage"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as ColumnStatus)}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary appearance-none cursor-pointer"
                  >
                    {COLUMNS.map((col) => (
                      <option key={col.id} value={col.id}>{col.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Skills */}
              <div className="space-y-1.5">
                <label htmlFor="manual-skills" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Skills Required (Comma separated)
                </label>
                <Input
                  id="manual-skills"
                  placeholder="React, TypeScript, GraphQL"
                  value={newSkills}
                  onChange={(e) => setNewSkills(e.target.value)}
                  className="rounded-xl"
                />
              </div>

              {/* Initial Notes */}
              <div className="space-y-1.5">
                <label htmlFor="manual-notes" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Notes / Checklist
                </label>
                <textarea
                  id="manual-notes"
                  placeholder="Interview schedule, resume version used, next steps..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full min-h-[80px] bg-background border border-border rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                />
              </div>

              <div className="flex gap-3 justify-end pt-3 border-t border-border/80 mt-5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddOpen(false)}
                  className="rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="rounded-xl font-bold shadow-md shadow-primary/10 cursor-pointer"
                >
                  Create Log
                </Button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* MODAL 2: View / Edit Existing Application */}
      {selectedApp && (
        <>
          {/* Backdrop overlay */}
          <div 
            onClick={() => setSelectedApp(null)}
            className="fixed inset-0 bg-background/60 backdrop-blur-sm z-50 animate-in fade-in-0 duration-200"
          />

          {/* Dialog Container */}
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl bg-card border border-border p-6 rounded-2xl shadow-2xl z-50 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between pb-4 border-b border-border/80 mb-5">
              <div className="space-y-1.5">
                <span className={cn(
                  "text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full border",
                  selectedApp.internship.source === 'linkedin' && "bg-blue-600/10 text-blue-600 border-blue-600/25",
                  selectedApp.internship.source === 'internshala' && "bg-orange-500/10 text-orange-600 border-orange-500/25",
                  selectedApp.internship.source === 'unstop' && "bg-purple-600/10 text-purple-600 border-purple-600/25",
                  selectedApp.internship.source === 'manual' && "bg-muted/10 text-muted-foreground border-border"
                )}>
                  {selectedApp.internship.source} Record
                </span>
                <h2 className="text-xl font-extrabold text-foreground tracking-tight">
                  {selectedApp.internship.title}
                </h2>
                <p className="text-sm font-semibold text-muted-foreground flex items-center gap-1.5">
                  <Building2 className="h-4 w-4" />
                  <span>{selectedApp.internship.company}</span>
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedApp(null)}
                className="rounded-full h-8 w-8 hover:bg-accent/80 cursor-pointer"
                aria-label="Close dialog"
              >
                <X className="h-4.5 w-4.5" />
              </Button>
            </div>

            <div className="space-y-6">
              {/* Info grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl border border-border bg-muted/10 space-y-1">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>Locations Info</span>
                  </span>
                  <p className="text-xs font-bold text-foreground truncate">
                    {selectedApp.internship.applyLink.includes('manual-application.local') 
                      ? 'Manual entry' 
                      : 'Linked opportunity'}
                  </p>
                </div>
                {selectedApp.internship.stipend && (
                  <div className="p-3.5 rounded-xl border border-border bg-muted/10 space-y-1">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      <span>Stipend Offer</span>
                    </span>
                    <p className="text-sm font-bold text-foreground">{selectedApp.internship.stipend}</p>
                  </div>
                )}
              </div>

              {/* Skills (if present) */}
              {selectedApp.internship.skillsRequired.length > 0 && (
                <div className="space-y-1.5">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Required Skills</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedApp.internship.skillsRequired.map((skill) => (
                      <span key={skill} className="text-xs bg-muted/80 text-muted-foreground border border-border px-2.5 py-0.5 rounded-lg font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <hr className="border-border/60" />

              {/* Edit Application Control Panel */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* Status Dropdown */}
                  <div className="space-y-1.5">
                    <label htmlFor="edit-status" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Pipeline Stage
                    </label>
                    <select
                      id="edit-status"
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value as ColumnStatus)}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary appearance-none cursor-pointer"
                    >
                      {COLUMNS.map((col) => (
                        <option key={col.id} value={col.id}>{col.title}</option>
                      ))}
                    </select>
                  </div>

                  {/* Resume Label Input */}
                  <div className="space-y-1.5">
                    <label htmlFor="edit-resume" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Resume Variant Used
                    </label>
                    <Input
                      id="edit-resume"
                      placeholder="e.g. SDE Resume v1"
                      value={editResume}
                      onChange={(e) => setEditResume(e.target.value)}
                      className="rounded-xl"
                    />
                  </div>
                </div>

                {/* Notes Input */}
                <div className="space-y-1.5">
                  <label htmlFor="edit-notes" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Application Notes
                  </label>
                  <textarea
                    id="edit-notes"
                    placeholder="Enter notes, interviewer feedback, checklists..."
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    className="w-full min-h-[120px] bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                  />
                </div>
              </div>

              {/* Action hints */}
              {!selectedApp.internship.applyLink.includes('manual-application.local') && (
                <div className="flex gap-2 p-3 rounded-xl border border-border bg-primary/5 text-xs text-muted-foreground">
                  <AlertCircle className="h-4.5 w-4.5 text-primary shrink-0" />
                  <p>
                    This application is linked to the live job feed. You can review the posting page at any time by clicking <a href={selectedApp.internship.applyLink} target="_blank" className="text-primary font-bold hover:underline">Apply Link</a>.
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 justify-between pt-4 border-t border-border/80 mt-6">
                {/* Delete Destructive trigger */}
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => handleDeleteApp(selectedApp.id)}
                  className="rounded-xl font-bold flex items-center gap-1.5 cursor-pointer shadow-sm hover:shadow-md"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Remove Application</span>
                </Button>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setSelectedApp(null)}
                    className="rounded-xl font-bold cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={() => handleUpdateApp(selectedApp.id, { status: editStatus, notes: editNotes, resumeUsed: editResume })}
                    className="rounded-xl font-bold shadow-md shadow-primary/10 cursor-pointer"
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
