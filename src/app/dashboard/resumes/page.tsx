'use client';

import * as React from 'react';
import { FileText, Upload, Sparkles, AlertCircle, CheckCircle2, Loader2, ArrowUpRight, HelpCircle, Download, CheckSquare } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ResumeDetails {
  id: string;
  fileUrl: string;
  atsScore: number;
  createdAt: string;
  parsedText?: string;
}

interface AIAnalysis {
  feedback: string;
  missingKeywords: string[];
  improvements: string[];
}

export default function ResumeIntelligencePage() {
  const [sessionUser, setSessionUser] = React.useState<{ id: string; name: string; email: string; college?: string; skills?: string[] } | null>(null);
  const [resume, setResume] = React.useState<ResumeDetails | null>(null);
  const [analysis, setAnalysis] = React.useState<AIAnalysis | null>(null);
  
  // Page states
  const [isPageLoading, setIsPageLoading] = React.useState(true);
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState('');
  const [uploadFile, setUploadFile] = React.useState<File | null>(null);
  const [uploadError, setUploadError] = React.useState('');
  const [isDragActive, setIsDragActive] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const loadData = React.useCallback(async () => {
    try {
      const stored = window.sessionStorage.getItem('user');
      if (!stored) {
        window.location.replace('/sign-in');
        return;
      }
      const user = JSON.parse(stored);
      setSessionUser(user);

      // Fetch resume from DB via Flask proxy
      const resumeRes = await fetch(`/api/resume?userId=${user.id}`);
      if (!resumeRes.ok) {
        if (resumeRes.status === 404 || resumeRes.status === 401) {
          window.sessionStorage.removeItem('user');
          window.location.replace('/sign-in');
          return;
        }
        throw new Error('API server down');
      }

      const resumeData = await resumeRes.json();
      setResume(resumeData.resume);
    } catch (e) {
      console.warn('Failed to load resume intelligence data:', e);
      setErrorMsg('Flask backend is offline. Please make sure the backend server is running.');
    } finally {
      setIsPageLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Drag-and-drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.pdf')) {
        setUploadFile(file);
      } else {
        setUploadError('Only PDF files are supported.');
      }
    }
  };

  const selectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!uploadFile || !sessionUser) return;
    setIsUploading(true);
    setUploadError('');
    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('userId', sessionUser.id);

      const res = await fetch('/api/resume', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload resume.');
      }

      setResume(data.resume);
      setUploadFile(null);
      // Reset any active analysis since resume changed
      setAnalysis(null);
      await loadData();
    } catch (err: any) {
      console.error(err);
      setUploadError(err.message || 'Server upload failed. Ensure server is online.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!resume || !sessionUser) return;
    setIsAnalyzing(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/resume/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: sessionUser.id })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to scan resume.');
      }

      setAnalysis(data);
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e.message || 'Groq connection failed. Please ensure the backend server and GROQ_API_KEY are configured.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Helper for filename
  const getFileName = (url: string) => {
    try {
      const decoded = decodeURIComponent(url);
      const parts = decoded.split('/');
      const last = parts[parts.length - 1];
      // strip prefix timestamp
      return last.replace(/^\d+-/, '');
    } catch {
      return 'Resume.pdf';
    }
  };

  if (isPageLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <FileText className="h-8 w-8 text-primary" />
          <span>Resume Intelligence</span>
        </h1>
        <p className="text-muted-foreground mt-1">
          Scan your resume against ATS compliance metrics and optimize for technical roles.
        </p>
      </div>

      {errorMsg && (
        <div className="flex items-start gap-2.5 rounded-xl border border-destructive/20 bg-destructive/5 p-3.5 text-xs text-destructive">
          <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
          <div className="font-semibold">{errorMsg}</div>
        </div>
      )}

      {!resume ? (
        // Empty Upload state
        <Card className="rounded-3xl border border-border/80 bg-background/50 backdrop-blur-md p-8 max-w-2xl mx-auto shadow-md">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <FileText className="h-7 w-7" />
            </div>
            <CardTitle className="text-xl font-bold">No Resume Found</CardTitle>
            <CardDescription className="text-sm px-6">
              You haven&apos;t uploaded any resume yet. Upload your PDF resume to parse skills, check ATS scores, and audit formatting.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            {uploadError && (
              <div className="flex items-start gap-2 rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-xs text-destructive">
                <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                <span className="font-semibold">{uploadError}</span>
              </div>
            )}

            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border p-10 text-center transition-all duration-200 cursor-pointer bg-muted/5 hover:bg-muted/10 hover:border-primary/50",
                isDragActive && "border-primary bg-primary/5"
              )}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={selectFile}
              />
              <Upload className="h-8 w-8 text-muted-foreground mb-3" />
              {uploadFile ? (
                <div>
                  <p className="text-sm font-semibold text-foreground truncate max-w-[280px]">{uploadFile.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{(uploadFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-semibold text-foreground">Select PDF resume</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Drag and drop file here (Max 5MB)</p>
                </div>
              )}
            </div>

            <Button
              onClick={handleUpload}
              disabled={!uploadFile || isUploading}
              className="w-full rounded-xl py-2.5 font-semibold cursor-pointer shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4.5 w-4.5 animate-spin" />
                  <span>Uploading PDF...</span>
                </>
              ) : (
                <span>Upload PDF Resume</span>
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (
        // Active layout: Left (Details & Scan) + Right (ATS score & Skills)
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-4">
          
          {/* Main Column */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Active Resume Card */}
            <Card className="rounded-3xl border border-border bg-card shadow-sm p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-foreground truncate max-w-[280px] sm:max-w-[400px]">
                      {getFileName(resume.fileUrl)}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                      <span>Uploaded on {new Date(resume.createdAt).toLocaleDateString()}</span>
                      <span>&middot;</span>
                      <a 
                        href={resume.fileUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-primary font-semibold hover:underline flex items-center gap-0.5 cursor-pointer"
                      >
                        <Download className="h-3 w-3" />
                        <span>Download PDF</span>
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className="rounded-xl flex items-center gap-1.5 font-semibold cursor-pointer shadow-sm shadow-primary/10 self-start sm:self-auto"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Analyzing...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        <span>Scan Resume</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>

            {/* AI Scan Results block */}
            {isAnalyzing && (
              <Card className="rounded-3xl border border-border bg-card shadow-sm p-12 text-center animate-pulse">
                <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto mb-3" />
                <h3 className="text-sm font-bold text-foreground">Evaluating ATS Compliance</h3>
                <p className="text-xs text-muted-foreground mt-1 px-10">
                  Llama is parsing grammar, cross-referencing your stated skills database, checking word layouts, and scanning for missing keywords...
                </p>
              </Card>
            )}

            {!isAnalyzing && !analysis && (
              <Card className="rounded-3xl border border-dashed border-border bg-card shadow-sm p-12 text-center">
                <Sparkles className="h-8 w-8 text-muted-foreground mx-auto mb-3 animate-bounce" />
                <h3 className="text-sm font-bold text-foreground">ATS Compliance Report</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                  Click the **Scan Resume** button above to evaluate your resume, fetch missing keywords, and get layout suggestions.
                </p>
              </Card>
            )}

            {!isAnalyzing && analysis && (
              <div className="space-y-6 animate-in fade-in duration-300">
                
                {/* General critique */}
                <Card className="rounded-3xl border border-border bg-card shadow-sm p-5 space-y-2.5">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span>Recruiter Critique</span>
                  </h3>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {analysis.feedback}
                  </p>
                </Card>

                {/* Missing keywords */}
                <Card className="rounded-3xl border border-border bg-card shadow-sm p-5 space-y-3">
                  <div>
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-500" />
                      <span>Missing Keywords</span>
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      ATS scanners filter profiles matching these exact terms. Inject these keywords naturally:
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {analysis.missingKeywords && analysis.missingKeywords.length > 0 ? (
                      analysis.missingKeywords.map(keyword => (
                        <span key={keyword} className="text-xs font-semibold bg-amber-500/10 border border-amber-500/25 text-amber-600 dark:text-amber-400 px-2.5 py-1 rounded-lg">
                          {keyword}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground">No missing keywords identified! Excellent compliance.</span>
                    )}
                  </div>
                </Card>

                {/* Formatting improvements */}
                <Card className="rounded-3xl border border-border bg-card shadow-sm p-5 space-y-3">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <CheckSquare className="h-4 w-4 text-primary" />
                    <span>Actionable Improvements</span>
                  </h3>
                  <ul className="space-y-2">
                    {analysis.improvements && analysis.improvements.length > 0 ? (
                      analysis.improvements.map((imp, idx) => (
                        <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                          <span className="flex h-4 w-4 items-center justify-center rounded bg-primary/10 text-primary shrink-0 font-semibold mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="leading-relaxed">{imp}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-xs text-muted-foreground">No improvement areas found! Your formatting is industry standard.</li>
                    )}
                  </ul>
                </Card>
              </div>
            )}

            {/* Replace/Update Widget */}
            <Card className="rounded-3xl border border-border bg-card shadow-sm p-5 space-y-4">
              <div>
                <h4 className="text-sm font-bold text-foreground">Replace Resume</h4>
                <p className="text-xs text-muted-foreground mt-0.5">Upload a new PDF to update your scorecard.</p>
              </div>

              {uploadError && (
                <div className="flex items-start gap-2 rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-xs text-destructive">
                  <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                  <span className="font-semibold">{uploadError}</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "flex-1 flex flex-col items-center justify-center rounded-xl border border-dashed border-border p-4 text-center cursor-pointer bg-muted/5 hover:bg-muted/10 hover:border-primary/50 transition-all",
                    isDragActive && "border-primary bg-primary/5"
                  )}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={selectFile}
                  />
                  {uploadFile ? (
                    <span className="text-xs font-semibold text-foreground truncate max-w-[200px]">{uploadFile.name}</span>
                  ) : (
                    <span className="text-xs text-muted-foreground">Drag new PDF here or click to browse</span>
                  )}
                </div>

                <Button
                  onClick={handleUpload}
                  disabled={!uploadFile || isUploading}
                  className="rounded-xl font-semibold cursor-pointer shadow-sm flex items-center justify-center gap-1.5 px-6 self-end sm:self-auto"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Replacing...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      <span>Upload New File</span>
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </div>

          {/* Right Sidebar Score & Skills */}
          <div className="space-y-4">
            
            {/* ATS Scorecard */}
            <Card className="rounded-3xl border border-border bg-card shadow-sm overflow-hidden">
              <div className="bg-primary/5 p-4 border-b border-border/50">
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest block">Dashboard Summary</span>
                <h3 className="text-sm font-bold text-foreground mt-0.5 flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-primary" />
                  <span>Estimated ATS Score</span>
                </h3>
              </div>
              <CardContent className="p-5 flex flex-col items-center justify-center py-6">
                <div className="relative flex items-center justify-center h-28 w-28 rounded-full border-4 border-primary/20">
                  <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin duration-1000 opacity-20" />
                  <span className="text-3xl font-extrabold text-foreground">{resume.atsScore}%</span>
                </div>
                <p className="text-[10px] font-bold text-muted-foreground mt-4 uppercase tracking-widest">Compliance Level</p>
              </CardContent>
            </Card>

            {/* Extracted Skills */}
            <Card className="rounded-3xl border border-border bg-card shadow-sm p-4.5 space-y-3">
              <h4 className="text-xs font-bold text-foreground">Extracted Skills</h4>
              <div className="flex flex-wrap gap-1">
                {sessionUser?.skills && sessionUser.skills.length > 0 ? (
                  sessionUser.skills.slice(0, 15).map(skill => (
                    <span key={skill} className="text-[10px] font-medium bg-muted/60 border border-border/70 text-foreground px-2 py-0.5 rounded-md">
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-[10px] text-muted-foreground">No matching skills found in database.</span>
                )}
              </div>
            </Card>

            {/* Quick tips */}
            <Card className="rounded-3xl border border-border bg-card p-4 shadow-sm text-xs text-muted-foreground space-y-2">
              <h4 className="font-bold text-foreground flex items-center gap-1">
                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Quick Tip</span>
              </h4>
              <p className="leading-relaxed">
                Aim for an ATS Score above **80%** to pass automatic recruiter filters. Running a scan will highlight formatting flaws and suggest vocabulary changes.
              </p>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
