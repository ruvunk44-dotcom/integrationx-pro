// tiny helper — mock user id in localStorage for MVP
export function getUserId() {
  if (typeof window === 'undefined') return 'anon'
  let uid = window.localStorage.getItem('dl_uid')
  if (!uid) {
    uid = 'u_' + Math.random().toString(36).slice(2, 12)
    window.localStorage.setItem('dl_uid', uid)
  }
  return uid
}

export function getUserName() {
  if (typeof window === 'undefined') return 'Learner'
  return window.localStorage.getItem('dl_uname') || 'Alex Doe'
}
