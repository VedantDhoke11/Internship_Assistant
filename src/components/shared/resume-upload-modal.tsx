'use client';

import * as React from 'react';
import { Upload, X, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ResumeUploadModalProps {
  isOpen: boolean;
  userId: string;
  onSuccess: () => void;
  onSkip: () => void;
}

export function ResumeUploadModal({ isOpen, userId, onSuccess, onSkip }: ResumeUploadModalProps) {
  const [isDragActive, setIsDragActive] = React.useState(false);
  const [file, setFile] = React.useState<File | null>(null);
  const [status, setStatus] = React.useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = React.useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    setErrorMessage('');
    setStatus('idle');
    
    // File type validation (PDF only)
    if (!selectedFile.name.endsWith('.pdf') && selectedFile.type !== 'application/pdf') {
      setErrorMessage('Please upload a PDF file only.');
      setStatus('error');
      return;
    }

    // Size check (Max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (selectedFile.size > maxSize) {
      setErrorMessage('Resume file size must be less than 5MB.');
      setStatus('error');
      return;
    }

    setFile(selectedFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async () => {
    if (!file) return;

    setStatus('loading');
    setErrorMessage('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', userId);

      const response = await fetch('/api/resume', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload resume.');
      }

      setStatus('success');
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err: any) {
      console.error('Resume upload modal error:', err);
      setStatus('error');
      setErrorMessage(err.message || 'Connection to the server failed. Make sure your server is online.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/40 backdrop-blur-sm cursor-default" 
        onClick={onSkip}
      />
      
      {/* Modal Container */}
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-border/80 bg-background/85 p-6 shadow-2xl backdrop-blur-md animate-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onSkip}
          className="absolute right-4 top-4 rounded-xl p-1 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Content */}
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <FileText className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Complete your profile
          </h2>
          <p className="text-sm text-muted-foreground mt-1.5 px-2">
            Upload your resume to activate the AI Career Advisor and get personalized application recommendations.
          </p>
        </div>

        {/* Status Messages */}
        {status === 'error' && (
          <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-destructive/20 bg-destructive/5 p-3.5 text-xs text-destructive text-left animate-in fade-in duration-200">
            <AlertCircle className="h-4.5 w-4.5 shrink-0 text-destructive mt-0.5" />
            <div className="font-semibold">{errorMessage}</div>
          </div>
        )}

        {status === 'success' && (
          <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-green-500/20 bg-green-500/5 p-3.5 text-xs text-green-600 dark:text-green-400 text-left animate-in fade-in duration-200">
            <CheckCircle2 className="h-4.5 w-4.5 shrink-0 text-green-500" />
            <div className="font-semibold">Resume parsed and stored. Activating intelligence...</div>
          </div>
        )}

        {/* Upload Zone */}
        {status !== 'success' && status !== 'loading' && (
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={triggerFileSelect}
            className={cn(
              "mt-5 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/80 p-8 text-center transition-all duration-200 cursor-pointer bg-muted/10 hover:bg-muted/20 hover:border-primary/50",
              isDragActive && "border-primary bg-primary/5 scale-[0.99]"
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={handleFileChange}
            />
            
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-background border border-border/80 shadow-sm text-muted-foreground mb-3 group-hover:scale-105 transition-transform duration-200">
              <Upload className="h-5 w-5" />
            </div>
            
            {file ? (
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground max-w-[280px] truncate">
                  {file.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB &middot; Click to change
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-sm font-bold text-foreground">
                  Drag and drop your PDF resume
                </p>
                <p className="text-xs text-muted-foreground">
                  or click to browse from device (Max 5MB)
                </p>
              </div>
            )}
          </div>
        )}

        {/* Loading State Display */}
        {status === 'loading' && (
          <div className="mt-5 flex flex-col items-center justify-center rounded-2xl border border-border bg-muted/10 p-12 text-center">
            <Loader2 className="h-8 w-8 text-primary animate-spin mb-3" />
            <p className="text-sm font-bold text-foreground">Uploading resume</p>
            <p className="text-xs text-muted-foreground mt-1">
              Extracting profile details and setting up your AI advisor...
            </p>
          </div>
        )}

        {/* Buttons Action */}
        <div className="mt-6 flex items-center justify-end gap-3">
          <Button
            variant="ghost"
            onClick={onSkip}
            disabled={status === 'loading'}
            className="rounded-xl font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
          >
            Skip for now
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!file || status === 'loading' || status === 'success'}
            className="rounded-xl px-5 font-semibold cursor-pointer shadow-sm shadow-primary/10"
          >
            Upload Resume
          </Button>
        </div>
      </div>
    </div>
  );
}
