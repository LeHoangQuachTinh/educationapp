import { readJson, writeJson } from './localStore'

const KEY = 'happyclass_chat_threads_v1'

// Thread keying: studentId (one parent per student in this prototype)
// Data shape:
// {
//   [studentId]: {
//     studentId,
//     teacherName,
//     parentName,
//     messages: Array<{ id, from: 'PARENT'|'TEACHER', text, ts }>
//   }
// }

function uid(prefix = 'msg') {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`
}

function seedDb() {
  const now = Date.now()
  return {
    stu_5A_1: {
      studentId: 'stu_5A_1',
      teacherName: 'Cô Nguyễn Thu Hoa',
      parentName: 'Phụ huynh bé Nam',
      messages: [
        {
          id: uid('m'),
          from: 'TEACHER',
          text: 'Chào phụ huynh, hôm nay bé tham gia hoạt động nhóm rất tích cực ạ.',
          ts: now - 1000 * 60 * 240,
        },
        {
          id: uid('m'),
          from: 'PARENT',
          text: 'Dạ cảm ơn cô. Bé ở nhà có hơi mệt, nhờ cô để ý giúp ạ.',
          ts: now - 1000 * 60 * 200,
        },
        {
          id: uid('m'),
          from: 'TEACHER',
          text: 'Vâng ạ. Em sẽ quan sát thêm và báo lại phụ huynh nếu có gì cần lưu ý.',
          ts: now - 1000 * 60 * 180,
        },
      ],
    },
  }
}

function ensureDb() {
  const db = readJson(KEY, null)
  if (db && typeof db === 'object') return db
  const seeded = seedDb()
  writeJson(KEY, seeded)
  return seeded
}

function saveDb(db) {
  writeJson(KEY, db)
}

export const chatService = {
  async getThread(studentId) {
    const db = ensureDb()
    const thread = db[studentId] || {
      studentId,
      teacherName: 'Giáo viên',
      parentName: 'Phụ huynh',
      messages: [],
    }
    return {
      ...thread,
      messages: [...(thread.messages || [])].sort((a, b) => a.ts - b.ts),
    }
  },

  async sendMessage({ studentId, from, text }) {
    const trimmed = (text || '').trim()
    if (!trimmed) return null

    const db = ensureDb()
    const prev = db[studentId] || {
      studentId,
      teacherName: 'Giáo viên',
      parentName: 'Phụ huynh',
      messages: [],
    }

    const msg = { id: uid('m'), from, text: trimmed, ts: Date.now() }
    const next = {
      ...prev,
      messages: [...(prev.messages || []), msg],
    }

    db[studentId] = next
    saveDb(db)

    return { ...msg }
  },

  async setParticipants({ studentId, teacherName, parentName }) {
    const db = ensureDb()
    const prev = db[studentId] || { studentId, messages: [] }
    db[studentId] = {
      ...prev,
      teacherName: teacherName || prev.teacherName,
      parentName: parentName || prev.parentName,
    }
    saveDb(db)
    return true
  },
}
