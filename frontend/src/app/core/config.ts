/**
 * API base URL. Overridden at build time for production via the fileReplacements
 * entry in angular.json; kept as a plain constant rather than an Angular
 * environment file because it is the only value that differs between builds.
 */
export const API_BASE_URL = 'http://localhost:8080/api/v1';

/** How long to wait for the API before giving up and keeping the static content. */
export const API_TIMEOUT_MS = 4000;
