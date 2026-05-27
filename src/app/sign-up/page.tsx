'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Github, Loader2, Mail, Lock, Eye, EyeOff, User, GraduationCap, Calendar } from 'lucide-react';
import { AuthLayoutWrapper } from '@/features/auth/components/auth-layout-wrapper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { validateEmail, validatePassword } from '@/lib/validations';

export default function SignUpPage() {
  const router = useRouter();

  React.useEffect(() => {
    try {
      const stored = window.localStorage.getItem('user');
      if (stored) {
        window.location.replace('/dashboard');
      }
    } catch {
      // Safe fallback
    }
  }, []);

  // State
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [college, setCollege] = React.useState('');
  const [gradYear, setGradYear] = React.useState('');
  
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  
  const [errors, setErrors] = React.useState<{
    name?: string;
    email?: string;
    password?: string;
    college?: string;
    gradYear?: string;
    general?: string;
  }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    let hasErrors = false;
    const newErrors: typeof errors = {};

    // Validations
    if (!name.trim()) {
      newErrors.name = 'Full name is required.';
      hasErrors = true;
    }

    if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid university or personal email.';
      hasErrors = true;
    }

    if (!validatePassword(password)) {
      newErrors.password = 'Password must be at least 8 characters long.';
      hasErrors = true;
    }

    if (!college.trim()) {
      newErrors.college = 'University or college name is required.';
      hasErrors = true;
    }

    const yearNum = parseInt(gradYear, 10);
    const currentYear = new Date().getFullYear();
    if (isNaN(yearNum) || yearNum < currentYear - 5 || yearNum > currentYear + 10) {
      newErrors.gradYear = `Please enter a valid graduation year (e.g., ${currentYear} - ${currentYear + 6})`;
      hasErrors = true;
    }

    if (hasErrors) {
      setErrors(newErrors);
      return;
    }

    // Trigger sign up sequence
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/sign-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, college, graduationYear: gradYear }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ general: data.error || 'Failed to create account. Please try again.' });
        setIsLoading(false);
        return;
      }

      // Store authenticated user in local storage
      window.localStorage.setItem('user', JSON.stringify(data.user));
      
      // Redirect to dashboard on success
      router.replace('/dashboard');
    } catch {
      setErrors({ general: 'An unexpected connection error occurred. Please try again.' });
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = (provider: 'google' | 'github') => {
    setIsLoading(true);
    console.log(`Mock sign up initiated using provider: ${provider}`);
    setTimeout(() => {
      const oauthUser = {
        name: provider === 'google' ? 'Google Student' : 'GitHub Developer',
        email: `student@${provider}.com`,
        college: 'OAuth Academy',
        graduationYear: 2027,
      };
      window.localStorage.setItem('user', JSON.stringify(oauthUser));
      router.replace('/dashboard');
    }, 800);
  };

  return (
    <AuthLayoutWrapper
      title="Create account"
      subtitle="Join InternshipOS to aggregate and track your applications"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div className="space-y-1">
          <label htmlFor="name" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-2.5 h-4.5 w-4.5 text-muted-foreground" />
            <Input
              id="name"
              type="text"
              placeholder="Alex Johnson"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              className="pl-10 rounded-xl"
              required
            />
          </div>
          {errors.name && (
            <p className="text-xs text-destructive mt-0.5 font-medium">{errors.name}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-1">
          <label htmlFor="email" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            University Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-2.5 h-4.5 w-4.5 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="alex@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="pl-10 rounded-xl"
              required
            />
          </div>
          {errors.email && (
            <p className="text-xs text-destructive mt-0.5 font-medium">{errors.email}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1">
          <label htmlFor="password" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-2.5 h-4.5 w-4.5 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className="pl-10 pr-10 rounded-xl"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-destructive mt-0.5 font-medium">{errors.password}</p>
          )}
        </div>

        {/* Two column University details */}
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2 space-y-1">
            <label htmlFor="college" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              University
            </label>
            <div className="relative">
              <GraduationCap className="absolute left-3.5 top-2.5 h-4.5 w-4.5 text-muted-foreground" />
              <Input
                id="college"
                type="text"
                placeholder="Stanford"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                disabled={isLoading}
                className="pl-10 rounded-xl"
                required
              />
            </div>
            {errors.college && (
              <p className="text-xs text-destructive mt-0.5 font-medium">{errors.college}</p>
            )}
          </div>

          <div className="col-span-1 space-y-1">
            <label htmlFor="gradYear" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Grad Year
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 h-4.5 w-4.5 text-muted-foreground" />
              <Input
                id="gradYear"
                type="number"
                placeholder="2027"
                value={gradYear}
                onChange={(e) => setGradYear(e.target.value)}
                disabled={isLoading}
                className="pl-9 pr-1 rounded-xl"
                required
              />
            </div>
            {errors.gradYear && (
              <p className="text-xs text-destructive mt-0.5 font-medium">{errors.gradYear}</p>
            )}
          </div>
        </div>

        {/* General Error Banner */}
        {errors.general && (
          <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive font-medium">
            {errors.general}
          </div>
        )}

        {/* Action Button */}
        <Button
          type="submit"
          className="w-full rounded-xl py-2.5 font-semibold shadow-sm shadow-primary/10 flex items-center justify-center gap-2 mt-2"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Creating account...</span>
            </>
          ) : (
            <span>Create Account</span>
          )}
        </Button>
      </form>

      {/* Divider */}
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-3 text-muted-foreground font-medium tracking-wider">
            Or continue with
          </span>
        </div>
      </div>

      {/* Social Login Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          type="button"
          onClick={() => handleOAuthLogin('google')}
          disabled={isLoading}
          className="rounded-xl flex items-center justify-center gap-2 border-border hover:bg-accent"
        >
          {/* Custom Google Logo SVG */}
          <svg className="h-4.5 w-4.5 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span className="text-xs font-semibold">Google</span>
        </Button>
        <Button
          variant="outline"
          type="button"
          onClick={() => handleOAuthLogin('github')}
          disabled={isLoading}
          className="rounded-xl flex items-center justify-center gap-2 border-border hover:bg-accent"
        >
          <Github className="h-4.5 w-4.5 text-foreground shrink-0" />
          <span className="text-xs font-semibold">GitHub</span>
        </Button>
      </div>

      {/* Redirect Footer */}
      <p className="mt-6 text-center text-xs text-muted-foreground">
        Already have an account?{' '}
        <Link
          href="/sign-in"
          className="font-bold text-primary hover:underline transition-colors"
        >
          Sign In instead
        </Link>
      </p>
    </AuthLayoutWrapper>
  );
}
