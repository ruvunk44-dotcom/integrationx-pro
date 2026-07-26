// Deprecated helper. Kept only to prevent import errors during transition.
// Real user identity comes from useAuth() (session cookie).
export function getUserId() {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem('dl_uid') || null
}
export function getUserName() {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem('dl_uname') || null
}
