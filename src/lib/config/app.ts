export const siteConfig = {
  name: 'InternshipOS',
  description: 'AI-powered Internship Assistant platform for students to aggregate, track, optimize, and secure their dream internships.',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  ogImage: '/og-image.png',
  creator: 'DeepMind Team',
  links: {
    github: 'https://github.com/internship-os/platform',
    twitter: 'https://twitter.com/internship_os',
  },
  mainNav: [
    {
      title: 'Home',
      href: '/',
    },
    {
      title: 'Internships',
      href: '/internships',
    },
    {
      title: 'AI Advisor',
      href: '/ai-assistant',
    },
    {
      title: 'Dashboard',
      href: '/dashboard',
    },
  ],
  dashboardNav: [
    {
      title: 'Overview',
      href: '/dashboard',
      icon: 'LayoutDashboard',
    },
    {
      title: 'Internship Feed',
      href: '/dashboard/internships',
      icon: 'Briefcase',
    },
    {
      title: 'Application Tracker',
      href: '/dashboard/applications',
      icon: 'KanbanSquare',
    },
    {
      title: 'Resume Intelligence',
      href: '/dashboard/resumes',
      icon: 'FileText',
    },
    {
      title: 'AI Career Advisor',
      href: '/dashboard/ai-advisor',
      icon: 'Sparkles',
    },
    {
      title: 'Analytics Insights',
      href: '/dashboard/analytics',
      icon: 'BarChart3',
    },
    {
      title: 'Account Settings',
      href: '/dashboard/settings',
      icon: 'Settings',
    },
  ],
};

export type SiteConfig = typeof siteConfig;
