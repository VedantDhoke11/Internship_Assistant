'use client';

import * as React from 'react';
import Link from 'next/link';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // Log the error to an analytics or error tracking service (e.g. Sentry)
    console.error('Unhandled route error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background px-4">
      <div className="mx-auto flex max-w-md flex-col items-center text-center">
        {/* Error Icon */}
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive border border-destructive/20 shadow-inner mb-6">
          <AlertCircle className="h-8 w-8" />
        </div>

        {/* Text */}
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Something went wrong
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          An unexpected error occurred during execution. We have logged this error and our team is inspecting the pipeline.
        </p>

        {/* Digest Info */}
        {error.digest && (
          <code className="mt-4 px-2 py-1 bg-muted border border-border rounded-lg text-xs font-mono text-muted-foreground select-all">
            Digest: {error.digest}
          </code>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3 w-full justify-center">
          <Button
            onClick={() => reset()}
            className="flex items-center gap-2 rounded-xl"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Try Again</span>
          </Button>
          <Link
            href="/"
            className={cn(
              buttonVariants({ variant: 'outline' }),
              'flex items-center gap-2 rounded-xl',
            )}
          >
            <Home className="h-4 w-4" />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
