import { readJson, writeJson } from './localStore'

const KEY = 'happyclass_notifications_v1'

// v2 Data shape:
// {
//   byStudentId: {
//     [studentId]: {
//       list: Array<{ id, text, createdAt, source: 'SYSTEM'|'TEACHER' }>,
//       readById: { [id]: true }
//     }
//   }
// }
//
// Migration:
// - If stored as v1: { list, readById }, we migrate into byStudentId['__legacy__'].

function seedList() {
  const now = Date.now()
  return [
    { id: 'n1', source: 'SYSTEM', text: 'Hệ thống: Bé Nam vừa được +2 điểm “Phát biểu hay”.', createdAt: now - 1000 * 60 * 8 },
    { id: 'n2', source: 'TEACHER', text: 'Cô giáo: Nhắc nhở nộp quỹ lớp trước thứ 6.', createdAt: now - 1000 * 60 * 45 },
    { id: 'n3', source: 'TEACHER', text: 'Cô giáo: Tuần tới kiểm tra giữa kỳ Toán và Tiếng Việt.', createdAt: now - 1000 * 60 * 120 },
  ]
}

function normalizeDb(raw) {
  if (!raw) return { byStudentId: {} }

  // v2
  if (raw.byStudentId) {
    return {
      byStudentId: { ...(raw.byStudentId || {}) },
    }
  }

  // v1 -> v2
  if (raw.list) {
    return {
      byStudentId: {
        __legacy__: {
          list: raw.list || [],
          readById: raw.readById || {},
        },
      },
    }
  }

  return { byStudentId: {} }
}

function ensureDb() {
  const raw = readJson(KEY, null)
  const db = normalizeDb(raw)

  // Ensure at least one seeded bucket so UI isn't empty on first run
  if (!Object.keys(db.byStudentId).length) {
    db.byStudentId.__legacy__ = { list: seedList(), readById: {} }
    writeJson(KEY, db)
  } else if (!raw?.byStudentId) {
    // Persist migration
    writeJson(KEY, db)
  }

  return db
}

function saveDb(db) {
  writeJson(KEY, db)
}

function ensureBucket(db, studentId) {
  const sid = studentId || '__legacy__'
  const prev = db.byStudentId[sid]
  if (prev) return { sid, bucket: prev }

  db.byStudentId[sid] = { list: [], readById: {} }
  return { sid, bucket: db.byStudentId[sid] }
}

export const notificationService = {
  async add({ studentId, id, source = 'SYSTEM', text, createdAt = Date.now() }) {
    const db = ensureDb()
    const { sid, bucket } = ensureBucket(db, studentId)

    const next = {
      id: id || `n_${Math.random().toString(16).slice(2)}_${Date.now()}`,
      source,
      text,
      createdAt,
    }

    db.byStudentId[sid] = {
      ...bucket,
      list: [next, ...(bucket.list || [])],
    }

    saveDb(db)
    return next
  },

  async list({ studentId } = {}) {
    const db = ensureDb()
    const { bucket } = ensureBucket(db, studentId)

    return {
      list: [...(bucket.list || [])].sort((a, b) => b.createdAt - a.createdAt),
      readById: { ...(bucket.readById || {}) },
    }
  },

  async markRead({ studentId, id }) {
    const db = ensureDb()
    const { sid, bucket } = ensureBucket(db, studentId)

    db.byStudentId[sid] = {
      ...bucket,
      readById: { ...(bucket.readById || {}), [id]: true },
    }
    saveDb(db)
    return true
  },

  async markAllRead({ studentId } = {}) {
    const db = ensureDb()
    const { sid, bucket } = ensureBucket(db, studentId)

    const next = { ...(bucket.readById || {}) }
    for (const n of bucket.list || []) next[n.id] = true

    db.byStudentId[sid] = { ...bucket, readById: next }
    saveDb(db)
    return true
  },
}
