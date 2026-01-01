import { readJson, writeJson } from './localStore'

const KEY = 'happyclass_daily_leaderboard_v1'

// Data shape:
// {
//   [classId]: {
//     [dateKey]: {
//       scores: { [studentId]: { studentId, name, pointsEarned, bestScore, updatedAt } }
//     }
//   }
// }

function ensureDb() {
  return readJson(KEY, {})
}

function saveDb(db) {
  writeJson(KEY, db)
}

export const dailyLeaderboardService = {
  async seedIfEmpty({ classId, dateKey }) {
    const db = ensureDb()
    const cls = db[classId] || {}
    const day = cls[dateKey]
    if (day?.scores && Object.keys(day.scores).length) return

    const now = Date.now()
    db[classId] = {
      ...cls,
      [dateKey]: {
        scores: {
          stu_5A_2: { studentId: 'stu_5A_2', name: 'Bạn B', pointsEarned: 6, bestScore: 9, updatedAt: now - 20000 },
          stu_5A_3: { studentId: 'stu_5A_3', name: 'Bạn C', pointsEarned: 10, bestScore: 12, updatedAt: now - 15000 },
        },
      },
    }
    saveDb(db)
  },

  async upsertScore({ classId, dateKey, studentId, name, pointsEarned = 0, score = 0 }) {
    const db = ensureDb()
    const cls = db[classId] || {}
    const day = cls[dateKey] || { scores: {} }
    const prev = day.scores?.[studentId]

    const next = {
      studentId,
      name: name || prev?.name || studentId,
      pointsEarned: (prev?.pointsEarned || 0) + pointsEarned,
      bestScore: Math.max(prev?.bestScore || 0, score),
      updatedAt: Date.now(),
    }

    const nextDay = {
      ...day,
      scores: { ...(day.scores || {}), [studentId]: next },
    }

    db[classId] = { ...cls, [dateKey]: nextDay }
    saveDb(db)

    return next
  },

  async list({ classId, dateKey }) {
    const db = ensureDb()
    const scores = db?.[classId]?.[dateKey]?.scores || {}
    return Object.values(scores)
      .sort((a, b) => (b.bestScore - a.bestScore) || (b.pointsEarned - a.pointsEarned) || (b.updatedAt - a.updatedAt))
  },
}
