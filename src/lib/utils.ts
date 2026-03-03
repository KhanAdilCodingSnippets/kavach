/**
 * KAVACH SECURITY UTILITY
 * Logic: Trims whitespace and ensures consistent casing.
 */
export const sanitizeInput = (input: string): string => {
  if (!input) return "";
  // .trim() removes the extra spaces like "Adil Khan " -> "Adil Khan"
  return input.trim();
};

export const sanitizeEmail = (email: string): string => {
  if (!email) return "";
  // .toLowerCase() makes "Adil@Gmail.Com" -> "adil@gmail.com"
  return email.trim().toLowerCase();
};