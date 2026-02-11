/**
 * Extracts a human-readable error message from unknown error types
 * and redacts sensitive information like admin tokens or secrets.
 */
export function formatErrorMessage(error: unknown): string {
  let message = 'An unknown error occurred';

  if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === 'string') {
    message = error;
  } else if (error && typeof error === 'object' && 'message' in error) {
    message = String((error as any).message);
  }

  // Redact sensitive patterns
  message = redactSensitiveInfo(message);

  return message;
}

/**
 * Redacts sensitive information from error messages.
 * Removes or obfuscates tokens, secrets, and other sensitive data.
 */
function redactSensitiveInfo(message: string): string {
  // Redact admin token query params
  message = message.replace(/caffeineAdminToken=[^&\s]+/gi, 'caffeineAdminToken=[REDACTED]');
  
  // Redact other common secret patterns
  message = message.replace(/token=[^&\s]+/gi, 'token=[REDACTED]');
  message = message.replace(/secret=[^&\s]+/gi, 'secret=[REDACTED]');
  message = message.replace(/password=[^&\s]+/gi, 'password=[REDACTED]');
  message = message.replace(/apikey=[^&\s]+/gi, 'apikey=[REDACTED]');
  
  // Redact bearer tokens
  message = message.replace(/Bearer\s+[^\s]+/gi, 'Bearer [REDACTED]');
  
  return message;
}

/**
 * Extracts backend trap messages from IC agent errors.
 */
export function extractBackendError(error: unknown): string | null {
  const message = formatErrorMessage(error);
  
  // Look for common IC error patterns
  if (message.includes('Unauthorized')) {
    return 'Unauthorized: You do not have permission to perform this action';
  }
  
  if (message.includes('trap')) {
    // Extract trap message if present
    const trapMatch = message.match(/trap[:\s]+(.+?)(?:\n|$)/i);
    if (trapMatch) {
      return trapMatch[1].trim();
    }
  }
  
  return null;
}
