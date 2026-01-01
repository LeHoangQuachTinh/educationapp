import { readJson, todayKey, writeJson } from './localStore'

const STORAGE_KEY = 'happyclass_attendance_records_v1'

// Data shape:
// {
//   [classId]: {
//     [dateKey]: {
//       // per student
//       statuses: { [studentId]: 'Present'|'Absent'|'Late' },
//       // metadata
//       updatedAt: number
//     }
//   }
// }

function ensureDb() {
  return readJson(STORAGE_KEY, {})
}

function saveDb(db) {
  writeJson(STORAGE_KEY, db)
}

export const attendanceService = {
  getTodayKey() {
    return todayKey()
  },

  async getRecord({ classId, dateKey = todayKey() }) {
    const db = ensureDb()
    const rec = db?.[classId]?.[dateKey] || null
    return rec ? { ...rec, statuses: { ...(rec.statuses || {}) } } : { statuses: {}, updatedAt: null }
  },

  async upsertStatus({ classId, dateKey = todayKey(), studentId, status }) {
    const db = ensureDb()
    const classBucket = db[classId] || {}
    const prev = classBucket[dateKey] || { statuses: {}, updatedAt: null }

    const next = {
      ...prev,
      statuses: { ...(prev.statuses || {}), [studentId]: status },
      updatedAt: Date.now(),
    }

    db[classId] = { ...classBucket, [dateKey]: next }
    saveDb(db)

    return { ...next, statuses: { ...next.statuses } }
  },

  async setAll({ classId, dateKey = todayKey(), studentIds, status }) {
    const db = ensureDb()
    const classBucket = db[classId] || {}
    const prev = classBucket[dateKey] || { statuses: {}, updatedAt: null }
    const nextStatuses = { ...(prev.statuses || {}) }
    for (const id of studentIds) nextStatuses[id] = status

    const next = { ...prev, statuses: nextStatuses, updatedAt: Date.now() }
    db[classId] = { ...classBucket, [dateKey]: next }
    saveDb(db)

    return { ...next, statuses: { ...next.statuses } }
  },
}
