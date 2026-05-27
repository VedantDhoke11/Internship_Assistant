'use client';

import * as React from 'react';
import { Sparkles, Send, Loader2, ArrowLeft, Bot, User as UserIcon, RefreshCw, FileText, CheckCircle2, ChevronRight, AlertCircle, HelpCircle, Upload } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ResumeDetails {
  id: string;
  fileUrl: string;
  atsScore: number;
  createdAt: string;
}

// Simple custom markdown formatter to render lists, bold text and newlines beautifully
function formatMessageContent(content: string) {
  const lines = content.split('\n');
  return lines.map((line, lineIdx) => {
    let renderedLine = line;
    
    // Handle bullet points
    const isBullet = line.trim().startsWith('- ') || line.trim().startsWith('* ');
    if (isBullet) {
      renderedLine = line.trim().replace(/^[-*]\s+/, '');
    }

    // Handle bold text (e.g. **text**)
    const boldRegex = /\*\*(.*?)\*\*/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = boldRegex.exec(renderedLine)) !== null) {
      if (match.index > lastIndex) {
        parts.push(renderedLine.substring(lastIndex, match.index));
      }
      parts.push(
        <strong key={match.index} className="font-bold text-foreground">
          {match[1]}
        </strong>
      );
      lastIndex = boldRegex.lastIndex;
    }
    
    if (lastIndex < renderedLine.length) {
      parts.push(renderedLine.substring(lastIndex));
    }

    const contentNode = parts.length > 0 ? parts : renderedLine;

    if (isBullet) {
      return (
        <li key={lineIdx} className="ml-4 list-disc pl-1 py-0.5 text-sm leading-relaxed text-muted-foreground">
          {contentNode}
        </li>
      );
    }

    return (
      <p key={lineIdx} className={cn("text-sm leading-relaxed text-muted-foreground", line.trim() === '' ? 'h-3' : 'mb-2')}>
        {contentNode}
      </p>
    );
  });
}

export default function AIAdvisorPage() {
  const [sessionUser, setSessionUser] = React.useState<{ id: string; name: string; email: string; college?: string; graduationYear?: number; skills?: string[] } | null>(null);
  const [resume, setResume] = React.useState<ResumeDetails | null>(null);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [input, setInput] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [isPageLoading, setIsPageLoading] = React.useState(true);
  const [errorMsg, setErrorMsg] = React.useState('');

  // direct upload states if they haven't uploaded
  const [uploadFile, setUploadFile] = React.useState<File | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadError, setUploadError] = React.useState('');
  const [isDragActive, setIsDragActive] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Authenticate session and fetch resume details + history
  const loadDashboardData = React.useCallback(async () => {
    try {
      const stored = window.sessionStorage.getItem('user');
      if (!stored) {
        window.location.replace('/sign-in');
        return;
      }
      const user = JSON.parse(stored);
      setSessionUser(user);

      // Fetch resume from DB
      const resumeRes = await fetch(`/api/resume?userId=${user.id}`);
      if (!resumeRes.ok) {
        if (resumeRes.status === 404 || resumeRes.status === 401) {
          window.sessionStorage.removeItem('user');
          window.location.replace('/sign-in');
          return;
        }
        setErrorMsg('Flask backend returned an error. Please make sure the backend server is running.');
        setIsPageLoading(false);
        return;
      }

      const resumeData = await resumeRes.json();
      setResume(resumeData.resume);

      if (resumeData.hasResume) {
        // Fetch chat history from DB
        const chatRes = await fetch(`/api/ai-advisor?userId=${user.id}`);
        if (chatRes.ok) {
          const chatData = await chatRes.json();
          const history = chatData.messages || [];
          setMessages(history);

          // If no history exists yet, trigger automatic initial career analysis based on the resume!
          if (history.length === 0) {
            setIsLoading(true);
            try {
              const initRes = await fetch('/api/ai-advisor', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  userId: user.id,
                  messages: [{ role: 'user', content: 'Please analyze my resume and college profile, and provide my initial career recommendations, skill gaps, and a targeted roadmap.' }]
                }),
              });
              if (initRes.ok) {
                const initData = await initRes.json();
                setMessages(initData.history);
              }
            } catch (err) {
              console.error('Failed to generate initial career analysis:', err);
            } finally {
              setIsLoading(false);
            }
          }
        }
      }
    } catch (e) {
      console.warn('Failed to load advisor data (Server offline):', e);
      setErrorMsg('Flask backend is offline. Please make sure the backend server is running.');
    } finally {
      setIsPageLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Handle direct file upload on this page
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

  const handleDirectUpload = async () => {
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
      
      // Load chat history or refresh
      await loadDashboardData();
    } catch (err: any) {
      console.error(err);
      setUploadError(err.message || 'Server upload failed. Ensure server is online.');
    } finally {
      setIsUploading(false);
    }
  };

  // Quick action tags/chips
  const handleStarterQuestion = async (text: string) => {
    if (isLoading) return;
    setInput('');
    setErrorMsg('');
    const newMessages: Message[] = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: sessionUser?.id,
          messages: newMessages,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Advisory failed.');
      }

      setMessages(data.history);
    } catch (e: any) {
      setErrorMsg(e.message || 'Failed to talk with Groq advisor. Ensure server is online.');
      // remove the user message that failed to prevent UI clutter
      setMessages(messages);
    } finally {
      setIsLoading(false);
    }
  };

  // Submit chat text input
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput('');
    setErrorMsg('');
    
    const newMessages: Message[] = [...messages, { role: 'user', content: userText }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: sessionUser?.id,
          messages: newMessages,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Advisory failed.');
      }

      setMessages(data.history);
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e.message || 'Groq connection failed. Please ensure the backend server and GROQ_API_KEY are configured.');
      // rollback messages
      setMessages(newMessages.filter(m => m.content !== userText));
    } finally {
      setIsLoading(false);
    }
  };

  if (isPageLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  // Fallback: If no resume uploaded, render direct upload zone
  if (!resume) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto animate-in fade-in-50 duration-300">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-primary" />
            <span>AI Career Advisor</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Upload your resume to activate the AI Career Advisor.
          </p>
        </div>

        <Card className="rounded-3xl border border-border/80 bg-background/50 backdrop-blur-md p-8 shadow-md">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <FileText className="h-7 w-7" />
            </div>
            <CardTitle className="text-xl font-bold">Upload Your Resume</CardTitle>
            <CardDescription className="text-sm px-6">
              Our AI advisor parses your resume PDF, aligns it with your college details, and highlights skills gaps or internship paths.
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
              onClick={handleDirectUpload}
              disabled={!uploadFile || isUploading}
              className="w-full rounded-xl py-2.5 font-semibold cursor-pointer shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4.5 w-4.5 animate-spin" />
                  <span>Processing & Parsing PDF...</span>
                </>
              ) : (
                <span>Activate AI Career Advisor</span>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Active Advisor: Dual-Column Chat + Resume Sidebar
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-primary animate-pulse" />
            <span>AI Career Advisor</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Real-time, context-aware coaching powered by Groq & your university resume.
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={loadDashboardData}
          className="rounded-xl flex items-center gap-1.5 self-start sm:self-auto border-border cursor-pointer hover:bg-accent"
        >
          <RefreshCw className="h-4 w-4" />
          <span className="font-semibold text-xs">Reload Chat</span>
        </Button>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-4">
        
        {/* Left Column: Chat Hub */}
        <div className="lg:col-span-3 flex flex-col h-[calc(100vh-16rem)] min-h-[480px] bg-card border border-border/80 rounded-3xl shadow-sm overflow-hidden relative">
          
          {/* Chat Messages Log */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center max-w-md mx-auto py-8">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <Bot className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-foreground">Welcome to your AI workspace!</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Hi {sessionUser?.name?.split(' ')[0] || 'Student'}, I&apos;ve analyzed your resume and skills. How can I guide you today? Select a starting recommendation below or write a query.
                </p>
                
                {/* Onboarding Starter Queries */}
                <div className="grid grid-cols-1 gap-2.5 w-full mt-6">
                  {[
                    "Suggest matching roles based on my resume skills",
                    "Do an ATS compliance check and list missing keywords",
                    "Suggest 3 portfolio projects to strengthen my resume",
                    "Give me typical interview questions for my targeted stack"
                  ].map((text, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleStarterQuestion(text)}
                      className="text-xs text-left p-3 border border-border/75 rounded-2xl bg-muted/10 hover:bg-primary/5 hover:border-primary/40 text-muted-foreground hover:text-foreground transition-all duration-200 cursor-pointer font-medium"
                    >
                      {text}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg, idx) => {
                const isAI = msg.role === 'assistant';
                return (
                  <div
                    key={idx}
                    className={cn(
                      "flex gap-3 max-w-[85%] animate-in fade-in duration-200",
                      isAI ? "self-start" : "self-end flex-row-reverse ml-auto"
                    )}
                  >
                    <div className={cn(
                      "h-8 w-8 rounded-xl shrink-0 flex items-center justify-center border",
                      isAI ? "bg-primary/10 text-primary border-primary/20" : "bg-muted text-foreground border-border/80"
                    )}>
                      {isAI ? <Bot className="h-4 w-4" /> : <UserIcon className="h-4 w-4" />}
                    </div>
                    <div className={cn(
                      "p-3.5 rounded-2xl text-xs space-y-1 shadow-sm",
                      isAI ? "bg-muted/15 border border-border/60 text-muted-foreground" : "bg-primary text-primary-foreground font-semibold"
                    )}>
                      {isAI ? formatMessageContent(msg.content) : <p className="leading-relaxed">{msg.content}</p>}
                    </div>
                  </div>
                );
              })
            )}

            {isLoading && (
              <div className="flex gap-3 max-w-[85%] self-start animate-in fade-in duration-200">
                <div className="h-8 w-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="p-3.5 rounded-2xl bg-muted/15 border border-border/60 text-muted-foreground text-xs flex items-center gap-2 shadow-sm">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                  <span>Groq is analyzing profile...</span>
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="flex items-start gap-2 rounded-xl border border-destructive/20 bg-destructive/5 p-3.5 text-xs text-destructive animate-in slide-in-from-top-2 duration-200">
                <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                <div className="font-semibold">{errorMsg}</div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested quick chips (Visible when history is not empty) */}
          {messages.length > 0 && !isLoading && (
            <div className="px-5 py-2 flex items-center gap-2 overflow-x-auto border-t border-border/40 bg-muted/5 scrollbar-none">
              <span className="text-[10px] font-bold text-muted-foreground uppercase shrink-0">Suggestions:</span>
              {[
                "Suggest projects",
                "ATS keywords scan",
                "Interview prep",
                "Resume feedback"
              ].map((chip) => (
                <button
                  key={chip}
                  onClick={() => handleStarterQuestion(chip === 'Suggest projects' ? 'Recommend 3 engineering portfolio projects for my stack' : chip === 'ATS keywords scan' ? 'Perform an ATS keyword scan on my resume' : chip === 'Interview prep' ? 'Provide a list of interview questions for my profile' : 'Give me constructive feedback on my resume structure')}
                  className="text-[11px] font-semibold text-muted-foreground hover:text-foreground bg-card hover:bg-accent border border-border/80 rounded-lg px-2.5 py-1.5 transition-colors cursor-pointer shrink-0"
                >
                  {chip}
                </button>
              ))}
            </div>
          )}

          {/* Form Input Row */}
          <form onSubmit={handleSend} className="p-4 border-t border-border bg-card flex gap-2">
            <Input
              type="text"
              placeholder="Ask career advice, request resume tweaks, draft emails..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              className="rounded-xl flex-1 bg-muted/10 border-border/80 focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary"
            />
            <Button
              type="submit"
              size="icon"
              disabled={isLoading || !input.trim()}
              className="rounded-xl shrink-0 cursor-pointer shadow-sm shadow-primary/10"
              aria-label="Send query"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>

        {/* Right Column: Resume Summary Sidebar */}
        <div className="space-y-4">
          <Card className="rounded-3xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="bg-primary/5 p-4 border-b border-border/50">
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest block">Model Dashboard</span>
              <h3 className="text-sm font-bold text-foreground mt-0.5 flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-primary" />
                <span>Resume Scorecard</span>
              </h3>
            </div>
            <CardContent className="p-5 space-y-4">
              
              {/* ATS SCORE CIRCLE */}
              <div className="flex flex-col items-center justify-center py-2">
                <div className="relative flex items-center justify-center h-24 w-24 rounded-full border-4 border-primary/20">
                  <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin duration-1000 opacity-20" />
                  <span className="text-3xl font-extrabold text-foreground">{resume.atsScore}%</span>
                </div>
                <p className="text-xs font-semibold text-muted-foreground mt-3 uppercase tracking-wider">ATS Score Estimate</p>
              </div>

              <hr className="border-border/60" />

              {/* Parsed Skills chips */}
              <div>
                <h4 className="text-xs font-bold text-foreground mb-2">Registered Skills</h4>
                <div className="flex flex-wrap gap-1">
                  {sessionUser?.skills && sessionUser.skills.length > 0 ? (
                    sessionUser.skills.slice(0, 12).map(skill => (
                      <span key={skill} className="text-[10px] font-medium bg-muted/60 border border-border/70 text-foreground px-2 py-0.5 rounded-md">
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-[10px] text-muted-foreground">No matching skills found.</span>
                  )}
                </div>
              </div>

              <hr className="border-border/60" />

              {/* Academic sync card */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground font-medium">Institution:</span>
                  <span className="font-semibold text-foreground truncate max-w-[130px]">{sessionUser?.college || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground font-medium">Graduation:</span>
                  <span className="font-semibold text-foreground">{sessionUser?.graduationYear || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground font-medium">Status:</span>
                  <span className="font-semibold text-green-600 dark:text-green-400 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Sync Active</span>
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Info Advisor Tips */}
          <Card className="rounded-3xl border border-border bg-card p-4 shadow-sm text-xs text-muted-foreground space-y-2">
            <h4 className="font-bold text-foreground flex items-center gap-1">
              <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Advisory Tip</span>
            </h4>
            <p className="leading-relaxed">
              If you update your resume offline, upload the new PDF using the direct interface on this page. The career advisor will re-parse the file and update recommendations instantly.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
