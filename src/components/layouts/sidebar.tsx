'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import * as Icons from 'lucide-react';
import { cn } from '@/lib/utils';
import { siteConfig } from '@/lib/config/app';
import { Button } from '@/components/ui/button';

interface DynamicIconProps {
  name: string;
  className?: string;
}

// Helper to render lucide icons dynamically based on siteConfig name strings
export function DynamicIcon({ name, className }: DynamicIconProps) {
  const IconComponent = (
    Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>
  )[name];
  if (!IconComponent) {
    return <Icons.HelpCircle className={className} />;
  }
  return <IconComponent className={className} />;
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [user, setUser] = React.useState<{ name: string; email: string } | null>(null);

  React.useEffect(() => {
    const loadUser = () => {
      try {
        const stored = window.sessionStorage.getItem('user');
        if (stored) {
          setUser(JSON.parse(stored));
        }
      } catch {
        // Safely ignore failures during SSR
      }
    };
    const handle = setTimeout(loadUser, 0);
    return () => clearTimeout(handle);
  }, []);

  const displayName = user?.name || 'John Doe';
  const displayEmail = user?.email || 'john.doe@university.edu';
  const displayInitials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'JD';

  return (
    <aside
      className={cn(
        'group/sidebar relative flex flex-col border-r border-border bg-card text-card-foreground transition-all duration-300 ease-in-out h-[calc(100vh-4rem)] sticky top-16',
        isCollapsed ? 'w-16' : 'w-64',
      )}
    >
      {/* Collapse toggle button */}
      <div className="absolute -right-3 top-6 z-20">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-6 w-6 rounded-full border border-border bg-background hover:bg-accent hover:text-accent-foreground shadow-sm"
          aria-label="Toggle sidebar"
        >
          {isCollapsed ? (
            <Icons.ChevronRight className="h-4.5 w-4.5" />
          ) : (
            <Icons.ChevronLeft className="h-4.5 w-4.5" />
          )}
        </Button>
      </div>

      {/* Navigation items */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {siteConfig.dashboardNav.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group/item duration-200',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/10'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              )}
            >
              <DynamicIcon
                name={item.icon}
                className={cn(
                  'h-5 w-5 shrink-0 transition-transform group-hover/item:scale-105',
                  isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover/item:text-foreground',
                )}
              />
              <span
                className={cn(
                  'transition-all duration-300',
                  isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 w-auto',
                )}
              >
                {item.title}
              </span>
            </Link>
          );
        })}
      </div>

      {/* User profile section at the bottom */}
      <div className="border-t border-border p-3">
        <div
          onClick={() => router.push('/dashboard/settings')}
          className={cn(
            'flex items-center gap-3 rounded-xl hover:bg-accent hover:text-accent-foreground transition-all duration-200 p-2 overflow-hidden cursor-pointer',
            isCollapsed ? 'justify-center' : '',
          )}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted border border-border font-bold text-sm text-foreground">
            {displayInitials}
          </div>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold truncate text-foreground leading-none">
                {displayName}
              </span>
              <span className="text-xs text-muted-foreground truncate mt-1">
                {displayEmail}
              </span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
