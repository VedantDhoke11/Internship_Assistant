'use client';

import * as React from 'react';
import { Navbar } from '@/components/layouts/navbar';
import { Sidebar } from '@/components/layouts/sidebar';
import Loading from '@/app/loading';
import { ResumeUploadModal } from '@/components/shared/resume-upload-modal';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAuthorized, setIsAuthorized] = React.useState<boolean | null>(null);
  const [hasResume, setHasResume] = React.useState<boolean | null>(null);
  const [skippedThisSession, setSkippedThisSession] = React.useState<boolean>(false);
  const [userId, setUserId] = React.useState<string>('');

  React.useEffect(() => {
    const checkSession = async () => {
      try {
        const stored = window.sessionStorage.getItem('user');
        if (!stored) {
          window.location.replace('/sign-in');
          return;
        }

        const user = JSON.parse(stored);
        if (!user || !user.id) {
          window.location.replace('/sign-in');
          return;
        }

        setUserId(user.id);
        setIsAuthorized(true);

        // Fetch resume status from Database
        try {
          const res = await fetch(`/api/resume?userId=${user.id}`);
          if (!res.ok) {
            if (res.status === 404 || res.status === 401 || res.status === 403) {
              window.sessionStorage.removeItem('user');
              window.location.replace('/sign-in');
              return;
            }
            console.warn('Backend API returned non-ok status:', res.status);
            setHasResume(true); // Fallback to hide modal
            return;
          }
          const data = await res.json();
          setHasResume(data.hasResume);
        } catch (dbError) {
          console.warn('Backend API is offline. Starting local server is recommended:', dbError);
          setHasResume(true); // Fallback to prevent blocking popup
        }
      } catch {
        window.sessionStorage.removeItem('user');
        window.location.replace('/sign-in');
      }
    };

    const handle = setTimeout(checkSession, 0);
    return () => clearTimeout(handle);
  }, []);

  if (isAuthorized === null) {
    return <Loading />;
  }

  if (!isAuthorized) {
    return null;
  }

  const showUploadModal = hasResume === false && !skippedThisSession;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-muted/20 p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>

      {/* Database-Backed Resume Upload Modal Popup */}
      <ResumeUploadModal
        isOpen={showUploadModal}
        userId={userId}
        onSuccess={() => setHasResume(true)}
        onSkip={() => setSkippedThisSession(true)}
      />
    </div>
  );
}

