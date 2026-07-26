import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import crypto from 'crypto'
import Razorpay from 'razorpay'
import { getDb } from '@/lib/mongodb'
import { COURSES, CATEGORIES, TESTIMONIALS, LIVE_BATCHES, FAQS, getCourseBySlug } from '@/lib/courses-data'
import { hashPassword, verifyPassword, signToken, verifyToken, cookieOptions, COOKIE, newUserId, readSessionFromRequest, sanitizeUser } from '@/lib/auth'
import { makeCertificatePdf, makeInvoicePdf } from '@/lib/pdfs'

const json = (data, status = 200) => NextResponse.json(data, { status })

// Razorpay singleton
let _razorpay = null
const getRazorpay = () => {
  if (!_razorpay) _razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET })
  return _razorpay
}

// require auth helper \u2014 returns session or 401 response
async function requireAuth(request) {
  const s = readSessionFromRequest(request)
  if (!s?.sub) return { error: json({ error: 'Not authenticated' }, 401) }
  return { userId: s.sub, email: s.email }
}

function baseUrl(request) {
  // Prefer configured public base URL (correct for OAuth callbacks behind proxies)
  if (process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL.replace(/\/$/, '')
  // Fallback: try Forwarded/X-Forwarded headers, then request.url
  const h = request.headers
  const proto = h.get('x-forwarded-proto') || 'https'
  const host = h.get('x-forwarded-host') || h.get('host')
  if (host) return `${proto}://${host}`
  const url = new URL(request.url)
  return `${url.protocol}//${url.host}`
}

async function handler(request, ctx) {
  const method = request.method
  const url = new URL(request.url)
  const params = ctx?.params ? await ctx.params : {}
  const seg = (params?.path || []).join('/')

  try {
    // GET /api/health
    if (method === 'GET' && (seg === 'health' || seg === '')) {
      return json({ ok: true, service: 'DevLearn Pro API', version: '1.0' })
    }

    // ========== AUTH ENDPOINTS ==========
    // POST /api/auth/register  { name, email, password }
    if (method === 'POST' && seg === 'auth/register') {
      const { name, email, password } = await request.json()
      if (!name || !email || !password) return json({ error: 'Missing fields' }, 400)
      if (password.length < 6) return json({ error: 'Password must be at least 6 characters' }, 400)
      const em = email.trim().toLowerCase()
      const db = await getDb()
      const existing = await db.collection('users').findOne({ email: em })
      if (existing) return json({ error: 'An account with this email already exists' }, 409)
      const passwordHash = await hashPassword(password)
      const user = { id: newUserId(), email: em, name: name.trim(), passwordHash, provider: 'credentials', role: 'student', avatar: null, createdAt: new Date().toISOString() }
      await db.collection('users').insertOne(user)
      const token = signToken({ sub: user.id, email: user.email, name: user.name })
      const res = json({ ok: true, user: sanitizeUser(user) })
      res.cookies.set(COOKIE, token, cookieOptions())
      return res
    }

    // POST /api/auth/login  { email, password }
    if (method === 'POST' && seg === 'auth/login') {
      const { email, password } = await request.json()
      if (!email || !password) return json({ error: 'Missing fields' }, 400)
      const em = email.trim().toLowerCase()
      const db = await getDb()
      const user = await db.collection('users').findOne({ email: em })
      if (!user || !user.passwordHash) return json({ error: 'Invalid email or password' }, 401)
      const ok = await verifyPassword(password, user.passwordHash)
      if (!ok) return json({ error: 'Invalid email or password' }, 401)
      const token = signToken({ sub: user.id, email: user.email, name: user.name })
      const res = json({ ok: true, user: sanitizeUser(user) })
      res.cookies.set(COOKIE, token, cookieOptions())
      return res
    }

    // POST /api/auth/logout
    if (method === 'POST' && seg === 'auth/logout') {
      const res = json({ ok: true })
      res.cookies.set(COOKIE, '', { ...cookieOptions(), maxAge: 0 })
      return res
    }

    // GET /api/auth/me
    if (method === 'GET' && seg === 'auth/me') {
      const s = readSessionFromRequest(request)
      if (!s?.sub) return json({ user: null })
      const db = await getDb()
      const u = await db.collection('users').findOne({ id: s.sub })
      if (!u) return json({ user: null })
      return json({ user: sanitizeUser(u) })
    }

    // GET /api/auth/google  \u2014 redirect to Google
    if (method === 'GET' && seg === 'auth/google') {
      const next = url.searchParams.get('next') || '/dashboard'
      const state = Buffer.from(JSON.stringify({ next, nonce: uuidv4() })).toString('base64url')
      const redirectUri = `${baseUrl(request)}/api/auth/google/callback`
      const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
      authUrl.searchParams.set('client_id', process.env.GOOGLE_CLIENT_ID)
      authUrl.searchParams.set('redirect_uri', redirectUri)
      authUrl.searchParams.set('response_type', 'code')
      authUrl.searchParams.set('scope', 'openid email profile')
      authUrl.searchParams.set('state', state)
      authUrl.searchParams.set('access_type', 'online')
      authUrl.searchParams.set('prompt', 'select_account')
      return NextResponse.redirect(authUrl.toString())
    }

    // GET /api/auth/google/callback  \u2014 handle Google response
    if (method === 'GET' && seg === 'auth/google/callback') {
      const code = url.searchParams.get('code')
      const stateRaw = url.searchParams.get('state')
      if (!code) return NextResponse.redirect(`${baseUrl(request)}/login?error=oauth_cancelled`)
      let next = '/dashboard'
      try { next = JSON.parse(Buffer.from(stateRaw, 'base64url').toString()).next || '/dashboard' } catch {}
      const redirectUri = `${baseUrl(request)}/api/auth/google/callback`
      // exchange code for tokens
      const tokRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code, client_id: process.env.GOOGLE_CLIENT_ID, client_secret: process.env.GOOGLE_CLIENT_SECRET, redirect_uri: redirectUri, grant_type: 'authorization_code',
        }),
      })
      const tokJson = await tokRes.json()
      if (!tokRes.ok || !tokJson.access_token) return NextResponse.redirect(`${baseUrl(request)}/login?error=oauth_token`)
      // fetch profile
      const profRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', { headers: { Authorization: `Bearer ${tokJson.access_token}` } })
      const prof = await profRes.json()
      if (!prof?.email) return NextResponse.redirect(`${baseUrl(request)}/login?error=oauth_profile`)
      const db = await getDb()
      const em = prof.email.toLowerCase()
      let user = await db.collection('users').findOne({ email: em })
      if (!user) {
        user = { id: newUserId(), email: em, name: prof.name || em.split('@')[0], avatar: prof.picture || null, provider: 'google', role: 'student', createdAt: new Date().toISOString(), googleId: prof.id }
        await db.collection('users').insertOne(user)
      } else if (!user.avatar && prof.picture) {
        await db.collection('users').updateOne({ id: user.id }, { $set: { avatar: prof.picture, googleId: prof.id } })
      }
      const token = signToken({ sub: user.id, email: user.email, name: user.name })
      const res = NextResponse.redirect(`${baseUrl(request)}${next.startsWith('/') ? next : '/dashboard'}`)
      res.cookies.set(COOKIE, token, cookieOptions())
      return res
    }
    // ========== END AUTH ==========

    // GET /api/catalog — full catalog snapshot
    if (method === 'GET' && seg === 'catalog') {
      return json({ categories: CATEGORIES, testimonials: TESTIMONIALS, liveBatches: LIVE_BATCHES, faqs: FAQS, stats: { students: 84000, courses: COURSES.length, instructors: 42, satisfaction: 98 } })
    }

    // GET /api/courses?category=...&level=...&q=...&sort=...
    if (method === 'GET' && seg === 'courses') {
      const category = url.searchParams.get('category')
      const level = url.searchParams.get('level')
      const q = (url.searchParams.get('q') || '').toLowerCase()
      const sort = url.searchParams.get('sort') || 'popular'
      let list = [...COURSES]
      if (category && category !== 'all') list = list.filter(c => c.category === category)
      if (level && level !== 'all') list = list.filter(c => c.level.toLowerCase() === level.toLowerCase())
      if (q) list = list.filter(c => (c.title + ' ' + c.subtitle + ' ' + c.skills.join(' ')).toLowerCase().includes(q))
      if (sort === 'newest') list.sort((a,b) => (a.badge === 'New' ? -1 : 1))
      else if (sort === 'price-low') list.sort((a,b) => a.price - b.price)
      else if (sort === 'price-high') list.sort((a,b) => b.price - a.price)
      else if (sort === 'rating') list.sort((a,b) => b.rating - a.rating)
      else list.sort((a,b) => b.students - a.students)
      return json({ courses: list, total: list.length })
    }

    // GET /api/courses/[slug]
    if (method === 'GET' && seg.startsWith('courses/')) {
      const slug = seg.slice('courses/'.length)
      const c = getCourseBySlug(slug)
      if (!c) return json({ error: 'Course not found' }, 404)
      return json({ course: c })
    }

    // POST /api/enroll  { courseSlug } \u2014 authenticated
    if (method === 'POST' && seg === 'enroll') {
      const auth = await requireAuth(request); if (auth.error) return auth.error
      const { courseSlug } = await request.json()
      if (!courseSlug) return json({ error: 'Missing fields' }, 400)
      const db = await getDb()
      const existing = await db.collection('enrollments').findOne({ userId: auth.userId, courseSlug })
      if (existing) return json({ ok: true, enrollment: { ...existing, _id: undefined }, existed: true })
      const doc = { id: uuidv4(), userId: auth.userId, courseSlug, enrolledAt: new Date().toISOString(), progress: 0, completedLessons: [] }
      await db.collection('enrollments').insertOne(doc)
      return json({ ok: true, enrollment: doc })
    }

    // GET /api/enrollments \u2014 authenticated (uses session userId)
    if (method === 'GET' && seg === 'enrollments') {
      const auth = await requireAuth(request); if (auth.error) return auth.error
      const db = await getDb()
      const list = await db.collection('enrollments').find({ userId: auth.userId }).sort({ enrolledAt: -1 }).toArray()
      const enriched = list.map(e => ({ ...e, _id: undefined, course: getCourseBySlug(e.courseSlug) }))
      return json({ enrollments: enriched })
    }

    // POST /api/progress  { courseSlug, lessonId, completed } \u2014 authenticated
    if (method === 'POST' && seg === 'progress') {
      const auth = await requireAuth(request); if (auth.error) return auth.error
      const { courseSlug, lessonId, completed } = await request.json()
      if (!courseSlug || !lessonId) return json({ error: 'Missing fields' }, 400)
      const db = await getDb()
      const course = getCourseBySlug(courseSlug)
      const total = course ? course.curriculum.reduce((n, m) => n + m.lessons.length, 0) : 1
      const existing = await db.collection('enrollments').findOne({ userId: auth.userId, courseSlug })
      let completedLessons = existing?.completedLessons || []
      if (completed) { if (!completedLessons.includes(lessonId)) completedLessons.push(lessonId) }
      else completedLessons = completedLessons.filter(l => l !== lessonId)
      const progress = Math.round((completedLessons.length / total) * 100)
      await db.collection('enrollments').updateOne(
        { userId: auth.userId, courseSlug },
        { $set: { completedLessons, progress, updatedAt: new Date().toISOString() }, $setOnInsert: { id: uuidv4(), userId: auth.userId, courseSlug, enrolledAt: new Date().toISOString() } },
        { upsert: true }
      )
      return json({ ok: true, progress, completedLessons })
    }

    // GET /api/progress?courseSlug=  \u2014 authenticated
    if (method === 'GET' && seg === 'progress') {
      const auth = await requireAuth(request); if (auth.error) return auth.error
      const courseSlug = url.searchParams.get('courseSlug')
      if (!courseSlug) return json({ progress: 0, completedLessons: [] })
      const db = await getDb()
      const e = await db.collection('enrollments').findOne({ userId: auth.userId, courseSlug })
      return json({ progress: e?.progress || 0, completedLessons: e?.completedLessons || [] })
    }

    // POST /api/notes  { courseSlug, lessonId, content }
    if (method === 'POST' && seg === 'notes') {
      const auth = await requireAuth(request); if (auth.error) return auth.error
      const { courseSlug, lessonId, content } = await request.json()
      if (!lessonId) return json({ error: 'Missing fields' }, 400)
      const db = await getDb()
      await db.collection('notes').updateOne(
        { userId: auth.userId, courseSlug, lessonId },
        { $set: { content, updatedAt: new Date().toISOString() }, $setOnInsert: { id: uuidv4(), userId: auth.userId, courseSlug, lessonId, createdAt: new Date().toISOString() } },
        { upsert: true }
      )
      return json({ ok: true })
    }

    // GET /api/notes?courseSlug=&lessonId=
    if (method === 'GET' && seg === 'notes') {
      const auth = await requireAuth(request); if (auth.error) return auth.error
      const courseSlug = url.searchParams.get('courseSlug')
      const lessonId = url.searchParams.get('lessonId')
      if (!lessonId) return json({ note: null })
      const db = await getDb()
      const n = await db.collection('notes').findOne({ userId: auth.userId, courseSlug, lessonId })
      return json({ note: n ? { content: n.content, updatedAt: n.updatedAt } : null })
    }

    // POST /api/wishlist  { courseSlug, action? }
    if (method === 'POST' && seg === 'wishlist') {
      const auth = await requireAuth(request); if (auth.error) return auth.error
      const { courseSlug, action } = await request.json()
      if (!courseSlug) return json({ error: 'Missing fields' }, 400)
      const db = await getDb()
      if (action === 'remove') await db.collection('wishlist').deleteOne({ userId: auth.userId, courseSlug })
      else await db.collection('wishlist').updateOne({ userId: auth.userId, courseSlug }, { $setOnInsert: { id: uuidv4(), userId: auth.userId, courseSlug, addedAt: new Date().toISOString() } }, { upsert: true })
      return json({ ok: true })
    }

    // GET /api/wishlist
    if (method === 'GET' && seg === 'wishlist') {
      const auth = await requireAuth(request); if (auth.error) return auth.error
      const db = await getDb()
      const items = await db.collection('wishlist').find({ userId: auth.userId }).toArray()
      const enriched = items.map(i => ({ courseSlug: i.courseSlug, course: getCourseBySlug(i.courseSlug), addedAt: i.addedAt }))
      return json({ wishlist: enriched })
    }

    // POST /api/payments/create-order  { courseSlug } \u2014 authenticated
    if (method === 'POST' && seg === 'payments/create-order') {
      const auth = await requireAuth(request); if (auth.error) return auth.error
      const { courseSlug } = await request.json()
      if (!courseSlug) return json({ error: 'Missing fields' }, 400)
      const course = getCourseBySlug(courseSlug)
      if (!course) return json({ error: 'Course not found' }, 404)
      const amountPaise = Math.round(course.price * 100)
      const receipt = `u_${auth.userId.slice(0, 8)}_${Date.now().toString().slice(-8)}`
      const order = await getRazorpay().orders.create({
        amount: amountPaise, currency: 'INR', receipt,
        notes: { userId: auth.userId, courseSlug, courseTitle: course.title.slice(0, 40) },
      })
      return json({
        orderId: order.id, amount: order.amount, currency: order.currency,
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        course: { slug: course.slug, title: course.title, price: course.price, thumbnail: course.thumbnail },
        user: { email: auth.email },
      })
    }

    // POST /api/payments/verify  { razorpay_order_id, razorpay_payment_id, razorpay_signature, courseSlug }
    if (method === 'POST' && seg === 'payments/verify') {
      const auth = await requireAuth(request); if (auth.error) return auth.error
      const body = await request.json()
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, courseSlug } = body
      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !courseSlug) return json({ error: 'Missing fields' }, 400)
      const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(`${razorpay_order_id}|${razorpay_payment_id}`).digest('hex')
      if (expected !== razorpay_signature) return json({ error: 'Invalid signature' }, 400)
      const db = await getDb()
      const course = getCourseBySlug(courseSlug)
      await db.collection('payments').updateOne(
        { razorpayOrderId: razorpay_order_id },
        { $set: { razorpayOrderId: razorpay_order_id, razorpayPaymentId: razorpay_payment_id, razorpaySignature: razorpay_signature, userId: auth.userId, courseSlug, courseTitle: course?.title, amountRupees: course?.price, status: 'captured', verifiedAt: new Date().toISOString() }, $setOnInsert: { id: uuidv4() } },
        { upsert: true }
      )
      await db.collection('enrollments').updateOne(
        { userId: auth.userId, courseSlug },
        { $set: { userId: auth.userId, courseSlug, status: 'active', paidAt: new Date().toISOString() }, $setOnInsert: { id: uuidv4(), enrolledAt: new Date().toISOString(), progress: 0, completedLessons: [] } },
        { upsert: true }
      )
      return json({ success: true, redirectTo: `/learn/${courseSlug}` })
    }

    // GET /api/payments  \u2014 payment history for signed-in user
    if (method === 'GET' && seg === 'payments') {
      const auth = await requireAuth(request); if (auth.error) return auth.error
      const db = await getDb()
      const list = await db.collection('payments').find({ userId: auth.userId }).sort({ verifiedAt: -1 }).limit(50).toArray()
      return json({ payments: list.map(p => ({ ...p, _id: undefined })) })
    }

    // ============ CERTIFICATES ============
    // GET /api/certificate/[courseSlug]  \u2014 generates PDF (only if 100% complete)
    if (method === 'GET' && seg.startsWith('certificate/')) {
      const auth = await requireAuth(request); if (auth.error) return auth.error
      const courseSlug = seg.slice('certificate/'.length)
      const course = getCourseBySlug(courseSlug)
      if (!course) return json({ error: 'Course not found' }, 404)
      const db = await getDb()
      const enrolment = await db.collection('enrollments').findOne({ userId: auth.userId, courseSlug })
      if (!enrolment) return json({ error: 'You are not enrolled in this course' }, 403)
      if ((enrolment.progress || 0) < 100) return json({ error: 'Complete 100% of the course to unlock the certificate' }, 403)
      // reuse or create cert record
      let cert = await db.collection('certificates').findOne({ userId: auth.userId, courseSlug })
      const user = await db.collection('users').findOne({ id: auth.userId })
      if (!cert) {
        cert = { id: 'IXP-' + uuidv4().replace(/-/g, '').slice(0, 12).toUpperCase(), userId: auth.userId, courseSlug, courseTitle: course.title, userName: user?.name || user?.email || 'Learner', instructor: course.instructor.name, issuedAt: new Date().toISOString() }
        await db.collection('certificates').insertOne(cert)
      }
      const verifyUrl = `${baseUrl(request)}/verify/${cert.id}`
      const bytes = await makeCertificatePdf({
        name: cert.userName,
        courseTitle: cert.courseTitle,
        instructor: cert.instructor,
        certId: cert.id,
        issueDate: new Date(cert.issuedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
        verifyUrl,
      })
      return new NextResponse(Buffer.from(bytes), {
        status: 200,
        headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="IntegrationXPro-${cert.id}.pdf"` },
      })
    }

    // GET /api/verify/[certId]  \u2014 public verification data
    if (method === 'GET' && seg.startsWith('verify/')) {
      const certId = seg.slice('verify/'.length)
      const db = await getDb()
      const cert = await db.collection('certificates').findOne({ id: certId })
      if (!cert) return json({ valid: false, error: 'Certificate not found or invalid' }, 404)
      return json({
        valid: true,
        certificate: {
          id: cert.id,
          userName: cert.userName,
          courseTitle: cert.courseTitle,
          instructor: cert.instructor,
          issuedAt: cert.issuedAt,
          issuedBy: 'IntegrationX Pro',
        },
      })
    }

    // GET /api/invoice/[paymentId]  \u2014 GST invoice PDF (owner only)
    if (method === 'GET' && seg.startsWith('invoice/')) {
      const auth = await requireAuth(request); if (auth.error) return auth.error
      const paymentId = seg.slice('invoice/'.length)
      const db = await getDb()
      const payment = await db.collection('payments').findOne({ razorpayPaymentId: paymentId, userId: auth.userId })
      if (!payment) return json({ error: 'Invoice not found' }, 404)
      const user = await db.collection('users').findOne({ id: auth.userId })
      const yr = new Date(payment.verifiedAt).getFullYear()
      const invoiceNo = `INV-${yr}-${payment.id.slice(0, 6).toUpperCase()}`
      const bytes = await makeInvoicePdf({
        invoiceNo,
        invoiceDate: new Date(payment.verifiedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
        buyerName: user?.name || 'Customer',
        buyerEmail: user?.email || '',
        courseTitle: payment.courseTitle || 'IntegrationX Pro Course',
        amountRupees: payment.amountRupees || 0,
        paymentId: payment.razorpayPaymentId,
      })
      return new NextResponse(Buffer.from(bytes), {
        status: 200,
        headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="${invoiceNo}.pdf"` },
      })
    }
    // ============ END CERTIFICATES ============

    // POST /api/newsletter { email }
    if (method === 'POST' && seg === 'newsletter') {
      const { email } = await request.json()
      if (!email) return json({ error: 'Missing email' }, 400)
      const db = await getDb()
      await db.collection('newsletter').updateOne({ email }, { $setOnInsert: { id: uuidv4(), email, subscribedAt: new Date().toISOString() } }, { upsert: true })
      return json({ ok: true })
    }

    return json({ error: 'Not found', path: seg }, 404)
  } catch (err) {
    console.error('API error:', err)
    return json({ error: err.message || 'Server error' }, 500)
  }
}

export const GET = handler
export const POST = handler
export const PUT = handler
export const DELETE = handler
export const PATCH = handler
