function delay(ms = 500) {
  return new Promise((res) => window.setTimeout(res, ms))
}

function uid(prefix = 'id') {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`
}

// THCS grading model (mock)
// Components (Combo A + B):
// - attendance (chuyên cần)
// - homework (BTVN)
// - quiz (quiz)
// - oral (miệng)
// - f15 (15')
// - midterm (giữa kỳ)
// - final (cuối kỳ)
// Weights (simple demo):
// attendance 5%, homework 10%, quiz 10%, oral 10%, f15 15%, midterm 20%, final 30%
const COMPONENTS = [
  { key: 'attendance', label: 'Chuyên cần', weight: 0.05 },
  { key: 'homework', label: 'BTVN', weight: 0.1 },
  { key: 'quiz', label: 'Quiz', weight: 0.1 },
  { key: 'oral', label: 'Miệng', weight: 0.1 },
  { key: 'f15', label: "15'", weight: 0.15 },
  { key: 'midterm', label: 'Giữa kỳ', weight: 0.2 },
  { key: 'final', label: 'Cuối kỳ', weight: 0.3 },
]

const SUBJECTS = [
  { id: 'math', name: 'Toán', icon: '📘' },
  { id: 'literature', name: 'Ngữ văn', icon: '📚' },
  { id: 'english', name: 'Tiếng Anh', icon: '🇬🇧' },
  { id: 'physics', name: 'Vật lý', icon: '🧲' },
  { id: 'chemistry', name: 'Hóa học', icon: '🧪' },
]

// db: classId -> studentId -> subjectId -> componentKey -> { score, note, updatedAt }
const db = {
  byClass: new Map(),
  studentToClass: new Map(),
}

function clampScore(v) {
  const n = Number(v)
  if (Number.isNaN(n)) return null
  return Math.max(0, Math.min(10, Math.round(n * 10) / 10))
}

function ensureClass(classId) {
  if (db.byClass.has(classId)) return

  // seed 20 students based on teacherService convention: stu_${classId}_${n}
  const classMap = new Map()
  for (let i = 1; i <= 20; i++) {
    const studentId = `stu_${classId}_${i}`
    db.studentToClass.set(studentId, classId)

    const subjMap = new Map()
    for (const sub of SUBJECTS) {
      const compMap = new Map()
      // seed some scores
      for (const c of COMPONENTS) {
        const base = ((i * 7 + sub.id.length * 9 + c.key.length * 3) % 41) / 4
        const score = clampScore(5.5 + base / 2)
        compMap.set(c.key, { score, note: '', updatedAt: Date.now() - 1000 * 60 * 60 * 24 })
      }
      subjMap.set(sub.id, compMap)
    }
    classMap.set(studentId, subjMap)
  }

  db.byClass.set(classId, classMap)
}

function ensureStudent(studentId) {
  const classId = db.studentToClass.get(studentId) || '5A'
  ensureClass(classId)
  return classId
}

function calcSubjectAverage(compMap) {
  // weighted average using available scores
  let sum = 0
  let wsum = 0

  for (const c of COMPONENTS) {
    const rec = compMap.get(c.key)
    const score = rec?.score
    if (typeof score === 'number') {
      sum += score * c.weight
      wsum += c.weight
    }
  }

  if (wsum === 0) return null
  return Math.round((sum / wsum) * 10) / 10
}

function calcOverallAverageByStudent(subjMap) {
  const avgs = []
  for (const sub of SUBJECTS) {
    const compMap = subjMap.get(sub.id)
    if (!compMap) continue
    const avg = calcSubjectAverage(compMap)
    if (typeof avg === 'number') avgs.push(avg)
  }
  if (!avgs.length) return null
  return Math.round((avgs.reduce((a, b) => a + b, 0) / avgs.length) * 10) / 10
}

export const gradeService = {
  async getMeta() {
    await delay(200)
    return { subjects: SUBJECTS, components: COMPONENTS }
  },

  async getSubjects(classId) {
    await delay(500)
    ensureClass(classId)
    return SUBJECTS.map((s) => ({ ...s }))
  },

  async getStudentGrades(studentId, term = 'HK1') {
    await delay(500)
    const classId = ensureStudent(studentId)
    const classMap = db.byClass.get(classId)
    const subjMap = classMap.get(studentId)

    const subjects = SUBJECTS.map((sub) => {
      const compMap = subjMap.get(sub.id)
      const components = COMPONENTS.map((c) => ({
        key: c.key,
        label: c.label,
        weight: c.weight,
        score: compMap.get(c.key)?.score ?? null,
        note: compMap.get(c.key)?.note ?? '',
      }))
      const average = calcSubjectAverage(compMap)
      return { subjectId: sub.id, subjectName: sub.name, icon: sub.icon, components, average }
    })

    return {
      studentId,
      classId,
      term,
      subjects,
      overallAverage: calcOverallAverageByStudent(subjMap),
    }
  },

  async getGradebookByClass(classId, term = 'HK1') {
    await delay(500)
    ensureClass(classId)

    const classMap = db.byClass.get(classId)
    const rows = []

    for (const [studentId, subjMap] of classMap.entries()) {
      const perSubject = {}
      for (const sub of SUBJECTS) {
        const avg = calcSubjectAverage(subjMap.get(sub.id))
        perSubject[sub.id] = avg
      }

      rows.push({
        studentId,
        // name is not stored here; teacherService will provide name/avatars. UI can join.
        perSubject,
        overallAverage: calcOverallAverageByStudent(subjMap),
      })
    }

    rows.sort((a, b) => (b.overallAverage || 0) - (a.overallAverage || 0))

    return {
      classId,
      term,
      subjects: SUBJECTS.map((s) => ({ ...s })),
      components: COMPONENTS.map((c) => ({ ...c })),
      rows,
    }
  },

  async upsertGrade({ classId, studentId, subjectId, componentKey, score, note = '' }) {
    await delay(500)
    ensureClass(classId)

    const classMap = db.byClass.get(classId)
    if (!classMap.has(studentId)) {
      const err = new Error('Không tìm thấy học sinh trong lớp')
      err.code = 'NOT_FOUND'
      throw err
    }

    const subjMap = classMap.get(studentId)
    if (!subjMap.has(subjectId)) {
      const err = new Error('Không tìm thấy môn')
      err.code = 'NOT_FOUND'
      throw err
    }

    const compMap = subjMap.get(subjectId)
    if (!compMap.has(componentKey)) {
      const err = new Error('Không tìm thấy loại điểm')
      err.code = 'NOT_FOUND'
      throw err
    }

    const next = { score: clampScore(score), note, updatedAt: Date.now() }
    compMap.set(componentKey, next)

    return {
      id: uid('grade'),
      classId,
      studentId,
      subjectId,
      componentKey,
      ...next,
    }
  },
}
