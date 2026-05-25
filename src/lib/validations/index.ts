// Basic validation utility types and functions for Stage 1 setup.
// In later stages, these will be replaced with Zod schemas.

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string): boolean {
  // At least 8 characters long
  return password.length >= 8;
}

export function validateProfile(data: { name: string; email: string }): ValidationResult<{ name: string; email: string }> {
  if (!data.name || data.name.trim().length === 0) {
    return { success: false, error: 'Name is required' };
  }
  if (!validateEmail(data.email)) {
    return { success: false, error: 'Invalid email address' };
  }
  return { success: true, data };
}
