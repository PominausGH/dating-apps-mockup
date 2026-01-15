/**
 * Validation utilities for authentication forms
 */

import { PasswordStrength, ValidationError } from '../types/auth';

export function validateEmail(email: string): ValidationError | null {
  if (!email.trim()) {
    return { field: 'email', message: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { field: 'email', message: 'Please enter a valid email address' };
  }

  return null;
}

export function validatePhone(phone: string): ValidationError | null {
  if (!phone.trim()) {
    return { field: 'phone', message: 'Phone number is required' };
  }

  // Simple phone validation - can be enhanced based on requirements
  const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
  if (!phoneRegex.test(phone)) {
    return { field: 'phone', message: 'Please enter a valid phone number' };
  }

  return null;
}

export function validateEmailOrPhone(input: string): ValidationError | null {
  if (!input.trim()) {
    return { field: 'emailOrPhone', message: 'Email or phone is required' };
  }

  // Check if it looks like an email
  if (input.includes('@')) {
    return validateEmail(input);
  }

  // Check if it looks like a phone number
  if (/^\d/.test(input)) {
    return validatePhone(input);
  }

  return { field: 'emailOrPhone', message: 'Please enter a valid email or phone number' };
}

export function checkPasswordStrength(password: string): PasswordStrength {
  if (!password) {
    return {
      score: 0,
      label: 'Enter a password',
      color: '#9CA3AF',
      meetsRequirements: false,
    };
  }

  let score = 0;
  const requirements = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  // Calculate score based on requirements
  if (requirements.length) score++;
  if (requirements.uppercase) score++;
  if (requirements.lowercase) score++;
  if (requirements.number) score++;
  if (requirements.special) score++;

  const meetsRequirements =
    requirements.length && requirements.uppercase && requirements.number;

  let label: string;
  let color: string;

  if (score === 0 || score === 1) {
    label = 'Weak';
    color = '#EF4444';
  } else if (score === 2) {
    label = 'Fair';
    color = '#F59E0B';
  } else if (score === 3) {
    label = 'Good';
    color = '#F59E0B';
  } else if (score === 4) {
    label = 'Strong';
    color = '#10B981';
  } else {
    label = 'Very Strong';
    color = '#10B981';
  }

  return {
    score,
    label,
    color,
    meetsRequirements,
  };
}

export function validatePassword(password: string): ValidationError | null {
  if (!password) {
    return { field: 'password', message: 'Password is required' };
  }

  const strength = checkPasswordStrength(password);

  if (!strength.meetsRequirements) {
    return {
      field: 'password',
      message: 'Password must be at least 8 characters with an uppercase letter and a number',
    };
  }

  return null;
}

export function validateConfirmPassword(
  password: string,
  confirmPassword: string
): ValidationError | null {
  if (!confirmPassword) {
    return { field: 'confirmPassword', message: 'Please confirm your password' };
  }

  if (password !== confirmPassword) {
    return { field: 'confirmPassword', message: 'Passwords do not match' };
  }

  return null;
}

export function validateTerms(agreed: boolean): ValidationError | null {
  if (!agreed) {
    return { field: 'terms', message: 'You must agree to the Terms of Service' };
  }
  return null;
}

export function validateAge(isOver18: boolean): ValidationError | null {
  if (!isOver18) {
    return { field: 'age', message: 'You must be 18 or older to use this app' };
  }
  return null;
}
