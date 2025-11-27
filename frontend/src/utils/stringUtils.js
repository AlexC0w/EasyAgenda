/**
 * Generates initials from a name, filtering out emojis and special characters.
 * @param {string} name - The full name.
 * @returns {string} - The initials (max 2 characters).
 */
export const getInitials = (name) => {
  if (!name) return '';

  // Remove emojis and non-letter characters (keeping spaces)
  // \p{L} matches any Unicode letter, \s matches whitespace
  const cleanName = name.replace(/[^\p{L}\s]/gu, '').trim();

  if (!cleanName) return '';

  const parts = cleanName.split(/\s+/);

  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }

  // Take first letter of first two words
  return (parts[0][0] + parts[1][0]).toUpperCase();
};
