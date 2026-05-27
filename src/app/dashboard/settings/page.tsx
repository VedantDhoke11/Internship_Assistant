'use client';

import * as React from 'react';
import { User, Mail, GraduationCap, Calendar, LogOut, Settings, Shield } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface UserSession {
  id?: string;
  name: string;
  email: string;
  college: string;
  graduationYear: number;
}

export default function SettingsPage() {
  const [user, setUser] = React.useState<UserSession | null>(null);

  React.useEffect(() => {
    const loadSession = () => {
      try {
        const stored = window.localStorage.getItem('user');
        if (stored) {
          setUser(JSON.parse(stored));
        }
      } catch {
        // Safe SSR check fallback
      }
    };

    const handle = setTimeout(loadSession, 0);
    return () => clearTimeout(handle);
  }, []);

  const handleSignOut = () => {
    try {
      window.localStorage.removeItem('user');
      window.location.replace('/');
    } catch (e) {
      console.error('Sign out error:', e);
    }
  };

  const displayName = user?.name || 'John Doe';
  const displayEmail = user?.email || 'john.doe@university.edu';
  const displayCollege = user?.college || 'Stanford University';
  const displayYear = user?.graduationYear || 2027;

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-300">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Settings className="h-8 w-8 text-primary" />
          <span>Account Settings</span>
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your personal details, academic connections, and system preferences.
        </p>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
        {/* Profile Card */}
        <div className="md:col-span-2 space-y-6">
          <Card className="rounded-2xl border border-border bg-card shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Student Profile</CardTitle>
              <CardDescription>Your university identity records synchronized from Supabase.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div className="space-y-1.5 p-3 rounded-xl border border-border/50 bg-muted/10">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5" />
                    <span>Full Name</span>
                  </span>
                  <p className="text-sm font-bold text-foreground mt-1">{displayName}</p>
                </div>

                {/* Email */}
                <div className="space-y-1.5 p-3 rounded-xl border border-border/50 bg-muted/10">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5" />
                    <span>Email Address</span>
                  </span>
                  <p className="text-sm font-bold text-foreground mt-1">{displayEmail}</p>
                </div>

                {/* College */}
                <div className="space-y-1.5 p-3 rounded-xl border border-border/50 bg-muted/10">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                    <GraduationCap className="h-3.5 w-3.5" />
                    <span>University</span>
                  </span>
                  <p className="text-sm font-bold text-foreground mt-1">{displayCollege}</p>
                </div>

                {/* Graduation Year */}
                <div className="space-y-1.5 p-3 rounded-xl border border-border/50 bg-muted/10">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Graduation Year</span>
                  </span>
                  <p className="text-sm font-bold text-foreground mt-1">{displayYear}</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t border-border/50 px-6 py-4 bg-muted/5 flex justify-between">
              <span className="text-xs text-muted-foreground">Registered session ID: {user?.id || 'offline_dev'}</span>
            </CardFooter>
          </Card>
        </div>

        {/* Account controls / Sign Out Panel */}
        <div className="space-y-6">
          <Card className="rounded-2xl border border-destructive/20 bg-destructive/5 text-foreground shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-destructive">
                <Shield className="h-5 w-5" />
                <span>Security Panel</span>
              </CardTitle>
              <CardDescription className="text-destructive/80 dark:text-muted-foreground">
                Sign out of your active browser session or manage system preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground leading-relaxed">
              Clicking the button below will securely clear your local student cookies/storage and redirect you back to the home gateway.
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleSignOut}
                variant="destructive"
                className="w-full rounded-xl flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all py-2.5 font-semibold"
              >
                <LogOut className="h-4.5 w-4.5" />
                <span>Sign Out of Platform</span>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
