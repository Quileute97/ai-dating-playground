/**
 * Get default avatar URL based on user gender
 * @param gender User gender ('male' | 'female' | other)
 * @param avatarUrl Current avatar URL (if any)
 * @returns Avatar URL to use
 */
export function getDefaultAvatar(gender?: string | null, avatarUrl?: string | null): string {
  // If user already has an avatar, use it
  if (avatarUrl) return avatarUrl;
  
  // Return default avatar based on gender
  if (gender === 'female' || gender === 'nữ' || gender === 'Nữ') {
    return '/images/default-avatar-female.jpg';
  }
  
  // Default fallback for male or unspecified
  return '/placeholder.svg';
}
