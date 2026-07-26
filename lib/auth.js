import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'

const SECRET = process.env.JWT_SECRET || 'change-me-in-prod'
const COOKIE_NAME = 'ixp_session'
const MAX_AGE = 60 * 60 * 24 * 7 // 7 days

export const hashPassword = (pw) => bcrypt.hash(pw, 10)
export const verifyPassword = (pw, hash) => bcrypt.compare(pw, hash)

export function signToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: MAX_AGE, algorithm: 'HS256' })
}

export function verifyToken(token) {
  try { return jwt.verify(token, SECRET) } catch { return null }
}

export function cookieOptions() {
  return {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE,
  }
}

export const COOKIE = COOKIE_NAME

export function newUserId() { return 'u_' + uuidv4().replace(/-/g, '').slice(0, 16) }

// read session from a NextRequest
export function readSessionFromRequest(request) {
  const token = request.cookies?.get?.(COOKIE_NAME)?.value
  if (!token) return null
  return verifyToken(token)
}

// sanitize user for client
export function sanitizeUser(u) {
  if (!u) return null
  const { passwordHash, _id, ...safe } = u
  return safe
}
