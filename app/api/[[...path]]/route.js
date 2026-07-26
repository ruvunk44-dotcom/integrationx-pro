import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import crypto from 'crypto'
import Razorpay from 'razorpay'
import { getDb } from '@/lib/mongodb'
import { COURSES, CATEGORIES, TESTIMONIALS, LIVE_BATCHES, FAQS, getCourseBySlug } from '@/lib/courses-data'

const json = (data, status = 200) => NextResponse.json(data, { status })

// Razorpay singleton
let _razorpay = null
const getRazorpay = () => {
  if (!_razorpay) _razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET })
  return _razorpay
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

    // POST /api/enroll  { userId, courseSlug }
    if (method === 'POST' && seg === 'enroll') {
      const body = await request.json()
      const { userId, courseSlug } = body
      if (!userId || !courseSlug) return json({ error: 'Missing fields' }, 400)
      const db = await getDb()
      const existing = await db.collection('enrollments').findOne({ userId, courseSlug })
      if (existing) return json({ ok: true, enrollment: existing, existed: true })
      const doc = { id: uuidv4(), userId, courseSlug, enrolledAt: new Date().toISOString(), progress: 0, completedLessons: [] }
      await db.collection('enrollments').insertOne(doc)
      return json({ ok: true, enrollment: doc })
    }

    // GET /api/enrollments?userId=xxx
    if (method === 'GET' && seg === 'enrollments') {
      const userId = url.searchParams.get('userId')
      if (!userId) return json({ enrollments: [] })
      const db = await getDb()
      const list = await db.collection('enrollments').find({ userId }).sort({ enrolledAt: -1 }).toArray()
      const enriched = list.map(e => ({ ...e, _id: undefined, course: getCourseBySlug(e.courseSlug) }))
      return json({ enrollments: enriched })
    }

    // POST /api/progress  { userId, courseSlug, lessonId, completed }
    if (method === 'POST' && seg === 'progress') {
      const { userId, courseSlug, lessonId, completed } = await request.json()
      if (!userId || !courseSlug || !lessonId) return json({ error: 'Missing fields' }, 400)
      const db = await getDb()
      const course = getCourseBySlug(courseSlug)
      const total = course ? course.curriculum.reduce((n, m) => n + m.lessons.length, 0) : 1
      const existing = await db.collection('enrollments').findOne({ userId, courseSlug })
      let completedLessons = existing?.completedLessons || []
      if (completed) { if (!completedLessons.includes(lessonId)) completedLessons.push(lessonId) }
      else completedLessons = completedLessons.filter(l => l !== lessonId)
      const progress = Math.round((completedLessons.length / total) * 100)
      await db.collection('enrollments').updateOne(
        { userId, courseSlug },
        { $set: { completedLessons, progress, updatedAt: new Date().toISOString() }, $setOnInsert: { id: uuidv4(), userId, courseSlug, enrolledAt: new Date().toISOString() } },
        { upsert: true }
      )
      return json({ ok: true, progress, completedLessons })
    }

    // GET /api/progress?userId=&courseSlug=
    if (method === 'GET' && seg === 'progress') {
      const userId = url.searchParams.get('userId')
      const courseSlug = url.searchParams.get('courseSlug')
      if (!userId || !courseSlug) return json({ progress: 0, completedLessons: [] })
      const db = await getDb()
      const e = await db.collection('enrollments').findOne({ userId, courseSlug })
      return json({ progress: e?.progress || 0, completedLessons: e?.completedLessons || [] })
    }

    // POST /api/notes  { userId, courseSlug, lessonId, content }
    if (method === 'POST' && seg === 'notes') {
      const { userId, courseSlug, lessonId, content } = await request.json()
      if (!userId || !lessonId) return json({ error: 'Missing fields' }, 400)
      const db = await getDb()
      await db.collection('notes').updateOne(
        { userId, courseSlug, lessonId },
        { $set: { content, updatedAt: new Date().toISOString() }, $setOnInsert: { id: uuidv4(), createdAt: new Date().toISOString() } },
        { upsert: true }
      )
      return json({ ok: true })
    }

    // GET /api/notes?userId=&courseSlug=&lessonId=
    if (method === 'GET' && seg === 'notes') {
      const userId = url.searchParams.get('userId')
      const courseSlug = url.searchParams.get('courseSlug')
      const lessonId = url.searchParams.get('lessonId')
      if (!userId || !lessonId) return json({ note: null })
      const db = await getDb()
      const n = await db.collection('notes').findOne({ userId, courseSlug, lessonId })
      return json({ note: n ? { content: n.content, updatedAt: n.updatedAt } : null })
    }

    // POST /api/wishlist  { userId, courseSlug }
    if (method === 'POST' && seg === 'wishlist') {
      const { userId, courseSlug, action } = await request.json()
      if (!userId || !courseSlug) return json({ error: 'Missing fields' }, 400)
      const db = await getDb()
      if (action === 'remove') {
        await db.collection('wishlist').deleteOne({ userId, courseSlug })
      } else {
        await db.collection('wishlist').updateOne({ userId, courseSlug }, { $setOnInsert: { id: uuidv4(), addedAt: new Date().toISOString() } }, { upsert: true })
      }
      return json({ ok: true })
    }

    // GET /api/wishlist?userId=
    if (method === 'GET' && seg === 'wishlist') {
      const userId = url.searchParams.get('userId')
      if (!userId) return json({ wishlist: [] })
      const db = await getDb()
      const items = await db.collection('wishlist').find({ userId }).toArray()
      const enriched = items.map(i => ({ courseSlug: i.courseSlug, course: getCourseBySlug(i.courseSlug), addedAt: i.addedAt }))
      return json({ wishlist: enriched })
    }

    // POST /api/payments/create-order  { userId, courseSlug }
    if (method === 'POST' && seg === 'payments/create-order') {
      const { userId, courseSlug } = await request.json()
      if (!userId || !courseSlug) return json({ error: 'Missing fields' }, 400)
      const course = getCourseBySlug(courseSlug)
      if (!course) return json({ error: 'Course not found' }, 404)
      const amountPaise = Math.round(course.price * 100)
      const receipt = `u_${userId.slice(0, 8)}_${Date.now().toString().slice(-8)}`
      const order = await getRazorpay().orders.create({
        amount: amountPaise,
        currency: 'INR',
        receipt,
        notes: { userId, courseSlug, courseTitle: course.title.slice(0, 40) },
      })
      return json({
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        course: { slug: course.slug, title: course.title, price: course.price, thumbnail: course.thumbnail },
      })
    }

    // POST /api/payments/verify  { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId, courseSlug }
    if (method === 'POST' && seg === 'payments/verify') {
      const body = await request.json()
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId, courseSlug } = body
      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !userId || !courseSlug) return json({ error: 'Missing fields' }, 400)
      const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(`${razorpay_order_id}|${razorpay_payment_id}`).digest('hex')
      if (expected !== razorpay_signature) return json({ error: 'Invalid signature' }, 400)
      const db = await getDb()
      const course = getCourseBySlug(courseSlug)
      // record payment
      await db.collection('payments').updateOne(
        { razorpayOrderId: razorpay_order_id },
        { $set: { razorpayOrderId: razorpay_order_id, razorpayPaymentId: razorpay_payment_id, razorpaySignature: razorpay_signature, userId, courseSlug, courseTitle: course?.title, amountRupees: course?.price, status: 'captured', verifiedAt: new Date().toISOString() }, $setOnInsert: { id: uuidv4() } },
        { upsert: true }
      )
      // enroll user
      await db.collection('enrollments').updateOne(
        { userId, courseSlug },
        { $set: { userId, courseSlug, status: 'active', paidAt: new Date().toISOString() }, $setOnInsert: { id: uuidv4(), enrolledAt: new Date().toISOString(), progress: 0, completedLessons: [] } },
        { upsert: true }
      )
      return json({ success: true, redirectTo: `/learn/${courseSlug}` })
    }

    // GET /api/payments?userId=xxx  \u2014 payment history
    if (method === 'GET' && seg === 'payments') {
      const userId = url.searchParams.get('userId')
      if (!userId) return json({ payments: [] })
      const db = await getDb()
      const list = await db.collection('payments').find({ userId }).sort({ verifiedAt: -1 }).limit(50).toArray()
      return json({ payments: list.map(p => ({ ...p, _id: undefined })) })
    }

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
