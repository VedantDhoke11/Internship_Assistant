// Global TypeScript Definitions for Internship Assistant

export interface User {
  id: string;
  name: string;
  email: string;
  college?: string;
  graduationYear?: number;
  branch?: string;
  skills: string[];
  createdAt: string;
}

export interface Resume {
  id: string;
  userId: string;
  fileUrl: string;
  parsedText?: string;
  atsScore?: number;
  createdAt: string;
}

export interface Internship {
  id: string;
  title: string;
  company: string;
  description: string;
  source: string;
  skillsRequired: string[];
  stipend?: string;
  applyLink: string;
  createdAt: string;
}

export type ApplicationStatus = 'Saved' | 'Applied' | 'OA' | 'Interview' | 'Rejected' | 'Offer';

export interface Application {
  id: string;
  userId: string;
  internshipId: string;
  status: ApplicationStatus;
  appliedAt: string;
  resumeUsedId?: string;
  notes?: string;
  updatedAt: string;
}

export interface AIInsight {
  id: string;
  userId: string;
  recommendation: string;
  generatedAt: string;
}
