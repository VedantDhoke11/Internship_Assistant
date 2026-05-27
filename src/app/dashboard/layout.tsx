'use client';

import * as React from 'react';
import { Navbar } from '@/components/layouts/navbar';
import { Sidebar } from '@/components/layouts/sidebar';
import Loading from '@/app/loading';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAuthorized, setIsAuthorized] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    const checkSession = () => {
      try {
        const stored = window.localStorage.getItem('user');
        if (!stored) {
          window.location.replace('/sign-in');
        } else {
          setIsAuthorized(true);
        }
      } catch {
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
    </div>
  );
}
