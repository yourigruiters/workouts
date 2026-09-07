/**
 * Translates Firebase Auth error codes and messages into clear, friendly user notifications.
 */
export function getFriendlyAuthErrorMessage(error: any): string {
  if (!error) return 'An unexpected error occurred. Please try again.';

  const code = (error.code || error.message || '').toString().toLowerCase();

  if (
    code.includes('auth/invalid-credential') ||
    code.includes('auth/wrong-password') ||
    code.includes('auth/user-not-found')
  ) {
    return 'Incorrect email or password. Please check your credentials and try again.';
  }

  if (code.includes('auth/email-already-in-use')) {
    return 'An account with this email already exists. Try signing in instead.';
  }

  if (code.includes('auth/invalid-email')) {
    return 'Please enter a valid email address.';
  }

  if (code.includes('auth/weak-password')) {
    return 'Password must be at least 6 characters long.';
  }

  if (code.includes('auth/missing-password')) {
    return 'Please enter your password.';
  }

  if (code.includes('auth/missing-email')) {
    return 'Please enter your email address.';
  }

  if (code.includes('auth/too-many-requests')) {
    return 'Too many failed attempts. Please wait a few moments and try again.';
  }

  if (code.includes('auth/network-request-failed')) {
    return 'Network connection issue. Please check your internet connection.';
  }

  if (code.includes('auth/user-disabled')) {
    return 'This account has been disabled. Please contact support.';
  }

  // Fallback: strip "Firebase: Error (auth/xxx)." wrapper if present
  const rawMessage = error.message || String(error);
  const cleanMessage = rawMessage
    .replace(/^Firebase:\s*Error\s*\([^)]*\):?\s*/i, '')
    .replace(/^Firebase:\s*/i, '')
    .trim();

  return cleanMessage || 'Authentication failed. Please check your input and try again.';
}
