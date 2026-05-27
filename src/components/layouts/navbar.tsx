'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, Menu, X, LayoutDashboard, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { siteConfig } from '@/lib/config/app';
import { Button, buttonVariants } from '@/components/ui/button';
import { ThemeToggle } from '@/components/shared/theme-toggle';

export function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);
  const [user, setUser] = React.useState<{ name: string } | null>(null);

  React.useEffect(() => {
    const loadSession = () => {
      try {
        const stored = window.sessionStorage.getItem('user');
        if (stored) {
          setUser(JSON.parse(stored));
        } else {
          setUser(null);
        }
      } catch {
        // Safe SSR check fallback
      }
    };

    const handle = setTimeout(loadSession, 0);
    return () => clearTimeout(handle);
  }, [pathname]);

  const handleSignOut = () => {
    try {
      window.sessionStorage.removeItem('user');
      setUser(null);
      setIsOpen(false);
      window.location.replace('/');
    } catch (e) {
      console.error('Sign out error:', e);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-md support-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/20">
              <Sparkles className="h-5 w-5 text-accent-foreground dark:text-primary-foreground" />
            </div>
            <span className="font-sans text-xl font-bold tracking-tight text-foreground">
              Internship<span className="text-muted-foreground font-medium">OS</span>
            </span>
          </Link>

          {/* Main Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {siteConfig.mainNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-foreground/80',
                  pathname === item.href ? 'text-foreground font-semibold' : 'text-muted-foreground',
                )}
              >
                {item.title}
              </Link>
            ))}
          </nav>
        </div>

        {/* Action Items */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3">
            <ThemeToggle />
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'flex items-center gap-1.5')}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Workspace</span>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  className="rounded-xl flex items-center gap-1.5 border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-all font-semibold cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </Button>
              </>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className={cn(
                    buttonVariants({ size: 'sm' }),
                    'rounded-xl shadow-sm hover:shadow-md transition-all flex items-center gap-2',
                  )}
                >
                  <span>Join Platform</span>
                  <Sparkles className="h-4 w-4" />
                </Link>
              </>
            )}
          </div>

          <div className="flex sm:hidden items-center gap-2">
            <ThemeToggle />
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden border-b border-border bg-background px-4 py-4 animate-in slide-in-from-top-5 duration-200">
          <nav className="flex flex-col gap-4">
            {siteConfig.mainNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  'text-base font-medium py-2 transition-colors hover:text-foreground/80',
                  pathname === item.href ? 'text-foreground font-semibold' : 'text-muted-foreground',
                )}
              >
                {item.title}
              </Link>
            ))}
            <hr className="my-2 border-border" />
            <div className="flex flex-col gap-2 pt-2">
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      buttonVariants({ variant: 'outline' }),
                      'w-full justify-center rounded-xl flex items-center gap-1.5',
                    )}
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Workspace</span>
                  </Link>
                  <Button
                    onClick={handleSignOut}
                    variant="destructive"
                    className="w-full justify-center rounded-xl flex items-center gap-1.5 font-semibold cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </Button>
                </>
              ) : (
                <>
                  <Link
                    href="/sign-in"
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      buttonVariants({ variant: 'outline' }),
                      'w-full justify-center rounded-xl',
                    )}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/sign-up"
                    onClick={() => setIsOpen(false)}
                    className={cn(buttonVariants({}), 'w-full justify-center rounded-xl')}
                  >
                    Join Platform
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
