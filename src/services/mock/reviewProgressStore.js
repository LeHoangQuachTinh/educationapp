import { readJson, todayKey, writeJson } from './localStore'

const KEY = 'happyclass_daily_review_progress_v1'

// Data shape:
// {
//   [studentId]: {
//     [dateKey]: {
//       completed: { [modeKey]: { ts, score, earned } }
//     }
//   }
// }

function ensureDb() {
  return readJson(KEY, {})
}

function saveDb(db) {
  writeJson(KEY, db)
}

export const reviewProgressStore = {
  todayKey,

  async getProgress({ studentId, dateKey = todayKey() }) {
    const db = ensureDb()
    const p = db?.[studentId]?.[dateKey] || { completed: {} }
    return { completed: { ...(p.completed || {}) } }
  },

  async markCompleted({ studentId, dateKey = todayKey(), modeKey, score, earned }) {
    const db = ensureDb()
    const studentBucket = db[studentId] || {}
    const day = studentBucket[dateKey] || { completed: {} }

    const next = {
      completed: {
        ...(day.completed || {}),
        [modeKey]: { ts: Date.now(), score, earned },
      },
    }

    db[studentId] = { ...studentBucket, [dateKey]: next }
    saveDb(db)
    return next
  },
}
