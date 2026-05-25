import { Sparkles } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background">
      <div className="relative flex flex-col items-center gap-4">
        {/* Glow effect */}
        <div className="absolute -inset-4 rounded-full bg-primary/10 blur-xl animate-pulse" />
        
        {/* Spinner ring */}
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-card border border-border shadow-md">
          <Sparkles className="h-8 w-8 text-primary animate-pulse" />
          <div className="absolute -inset-0.5 rounded-2xl border-t-2 border-primary animate-spin" />
        </div>
        
        {/* Loading text */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-sm font-semibold tracking-wide text-foreground">
            Loading InternshipOS
          </span>
          <span className="text-xs text-muted-foreground animate-pulse">
            Configuring workspaces...
          </span>
        </div>
      </div>
    </div>
  );
}
