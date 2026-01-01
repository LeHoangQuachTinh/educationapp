import { readJson, todayKey, writeJson } from './localStore'

const KEY = 'happyclass_leave_requests_v1'

// Types:
// - ABSENCE: xin nghỉ học
// - PICKUP_CHANGE: thay đổi người đón / đón muộn
// 
// Data shape:
// {
//   [dateKey]: {
//     [studentId]: Array<{
//       id,
//       type,
//       studentId,
//       dateKey,
//       reason,
//       pickupBy,
//       pickupPhone,
//       createdAt,
//       status: 'PENDING'|'APPROVED'|'REJECTED',
//       teacherNote,
//       updatedAt
//     }>
//   }
// }

function uid(prefix = 'req') {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`
}

function ensureDb() {
  return readJson(KEY, {})
}

function saveDb(db) {
  writeJson(KEY, db)
}

function normalize(req) {
  return {
    id: req.id,
    type: req.type,
    studentId: req.studentId,
    dateKey: req.dateKey,
    reason: req.reason || '',
    pickupBy: req.pickupBy || '',
    pickupPhone: req.pickupPhone || '',
    createdAt: req.createdAt,
    status: req.status,
    teacherNote: req.teacherNote || '',
    updatedAt: req.updatedAt,
  }
}

export const leaveRequestService = {
  getTodayKey() {
    return todayKey()
  },

  async create({ type, studentId, dateKey = todayKey(), reason, pickupBy, pickupPhone }) {
    const db = ensureDb()
    const bucket = db[dateKey] || {}
    const list = bucket[studentId] || []

    const now = Date.now()
    const req = normalize({
      id: uid('req'),
      type,
      studentId,
      dateKey,
      reason,
      pickupBy,
      pickupPhone,
      createdAt: now,
      status: 'PENDING',
      teacherNote: '',
      updatedAt: now,
    })

    db[dateKey] = { ...bucket, [studentId]: [req, ...list] }
    saveDb(db)

    return req
  },

  async listByDate({ dateKey = todayKey() }) {
    const db = ensureDb()
    const bucket = db[dateKey] || {}

    const out = []
    for (const [studentId, reqs] of Object.entries(bucket)) {
      for (const r of reqs || []) out.push(normalize({ ...r, studentId }))
    }

    return out.sort((a, b) => b.createdAt - a.createdAt)
  },

  async listByStudent({ studentId }) {
    const db = ensureDb()
    const out = []
    for (const [dateKey, bucket] of Object.entries(db)) {
      const reqs = bucket?.[studentId] || []
      for (const r of reqs) out.push(normalize({ ...r, dateKey }))
    }
    return out.sort((a, b) => b.createdAt - a.createdAt)
  },

  async updateStatus({ id, studentId, dateKey, status, teacherNote }) {
    const db = ensureDb()
    const bucket = db[dateKey] || {}
    const reqs = bucket[studentId] || []

    const idx = reqs.findIndex((r) => r.id === id)
    if (idx === -1) return null

    const prev = reqs[idx]
    const next = normalize({
      ...prev,
      status,
      teacherNote: teacherNote ?? prev.teacherNote,
      updatedAt: Date.now(),
    })

    const nextReqs = [...reqs]
    nextReqs[idx] = next

    db[dateKey] = { ...bucket, [studentId]: nextReqs }
    saveDb(db)

    return next
  },
}
