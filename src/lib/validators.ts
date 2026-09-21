/**
 * Validates an API key.
 * @param key The API key to validate.
 * @returns An error message if invalid, or null if valid.
 */
export const validateApiKey = (key: string): string | null => {
  if (key.length < 8) {
    return 'API key must be at least 8 characters long.';
  }
  // Simple regex for common API key formats (alphanumeric, hyphens, underscores, dots)
  const apiKeyRegex = /^[a-zA-Z0-9._-]+$/;
  if (!apiKeyRegex.test(key)) {
    return 'API key contains invalid characters. Use only letters, numbers, dots, hyphens, or underscores.';
  }
  return null;
};
