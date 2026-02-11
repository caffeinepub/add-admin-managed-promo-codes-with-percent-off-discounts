/**
 * Utility functions for generating base-path-safe asset and document URLs
 * for static hosting environments (e.g., cPanel subdirectory deployments)
 */

/**
 * Get the base URL for the application
 * In production builds, this respects the BASE_URL environment variable
 */
const getBaseUrl = (): string => {
  return import.meta.env.BASE_URL || '/';
};

/**
 * Generate a base-path-safe URL for static assets
 * @param assetPath - Path relative to the public directory (e.g., '/assets/logo.png')
 * @returns Full URL that works with any base path configuration
 */
export const getAssetUrl = (assetPath: string): string => {
  const base = getBaseUrl();
  // Remove leading slash from assetPath if present to avoid double slashes
  const cleanPath = assetPath.startsWith('/') ? assetPath.slice(1) : assetPath;
  // Ensure base ends with slash
  const cleanBase = base.endsWith('/') ? base : `${base}/`;
  return `${cleanBase}${cleanPath}`;
};

/**
 * Generate a base-path-safe URL for documents
 * @param docPath - Path to the document (e.g., 'DEPLOYMENT.md')
 * @returns Full URL that works with any base path configuration
 */
export const getDocumentUrl = (docPath: string): string => {
  const base = getBaseUrl();
  const cleanPath = docPath.startsWith('/') ? docPath.slice(1) : docPath;
  const cleanBase = base.endsWith('/') ? base : `${base}/`;
  return `${cleanBase}${cleanPath}`;
};
