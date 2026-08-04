/**
 * Environment variable validation for production readiness.
 * This module validates that required environment variables are set
 * and provides helpful error messages.
 */

export interface EnvValidationResult {
  valid: boolean;
  missing: string[];
  warnings: string[];
}

const REQUIRED_SERVER = [
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
] as const;

const REQUIRED_CLIENT = [
  "VITE_SUPABASE_URL",
  "VITE_SUPABASE_PUBLISHABLE_KEY",
] as const;

const RECOMMENDED = [
  "PUBLIC_SITE_URL",
  "RESEND_API_KEY",
  "STRIPE_SECRET_KEY",
  "VITE_STRIPE_PUBLISHABLE_KEY",
] as const;

/**
 * Validates server-side environment variables.
 * Call this at server startup.
 */
export function validateServerEnv(): EnvValidationResult {
  const missing: string[] = [];
  const warnings: string[] = [];

  for (const key of REQUIRED_SERVER) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  for (const key of RECOMMENDED) {
    if (!process.env[key]) {
      warnings.push(`${key} is not set - some features may not work`);
    }
  }

  return {
    valid: missing.length === 0,
    missing: [...missing],
    warnings: [...warnings],
  };
}

/**
 * Validates client-side environment variables.
 * Call this at app initialization.
 */
export function validateClientEnv(): EnvValidationResult {
  const missing: string[] = [];

  for (const key of REQUIRED_CLIENT) {
    const value = import.meta.env[key];
    if (!value || value === `{{${key}}}`) {
      missing.push(key);
    }
  }

  return {
    valid: missing.length === 0,
    missing,
    warnings: [],
  };
}

/**
 * Get the site URL with proper trailing slash handling.
 */
export function getSiteUrl(): string {
  const url = process.env.PUBLIC_SITE_URL ?? "";
  return url.replace(/\/$/, "");
}

/**
 * Check if running in production mode.
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

/**
 * Check if email is configured (Resend API key present).
 */
export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

/**
 * Check if Stripe is configured.
 */
export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET);
}
