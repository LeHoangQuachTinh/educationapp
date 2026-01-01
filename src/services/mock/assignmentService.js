function delay(ms = 500) {
  return new Promise((res) => window.setTimeout(res, ms))
}

// In-memory DB for assignments & submissions
const db = {
  assignments: [],
  submissions: [],
}

function uid(prefix = 'id') {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`
}

function ensureSeed() {
  if (db.assignments.length) return

  db.assignments = [
    {
      id: 'as_5A_1',
      classId: '5A',
      subject: 'Toán',
      title: 'Bài tập: Phân số (cơ bản)',
      description:
        'Làm bài 1-5 trang 32 SGK. Ghi rõ cách làm. Chụp ảnh nộp lên hệ thống.',
      dueAt: Date.now() + 1000 * 60 * 60 * 24 * 2,
      pointsReward: 5,
      createdBy: 'gv1',
      createdAt: Date.now() - 1000 * 60 * 60 * 6,
    },
    {
      id: 'as_5A_2',
      classId: '5A',
      subject: 'Tiếng Việt',
      title: 'Viết đoạn văn ngắn (5–7 câu)',
      description: 'Viết về “Một việc tốt em đã làm”. Nộp trước 20:00 hôm nay.',
      dueAt: Date.now() + 1000 * 60 * 60 * 8,
      pointsReward: 3,
      createdBy: 'gv1',
      createdAt: Date.now() - 1000 * 60 * 60 * 2,
    },
    {
      id: 'as_5B_1',
      classId: '5B',
      subject: 'Khoa học',
      title: 'Ôn tập: Hệ hô hấp',
      description: 'Trả lời 5 câu hỏi cuối bài. Chuẩn bị 1 ví dụ về thói quen tốt cho phổi.',
      dueAt: Date.now() + 1000 * 60 * 60 * 24,
      pointsReward: 4,
      createdBy: 'gv1',
      createdAt: Date.now() - 1000 * 60 * 60 * 4,
    },
  ]
}

export const assignmentService = {
  async listAssignments({ classId, studentId } = {}) {
    await delay(500)
    ensureSeed()

    const list = db.assignments
      .filter((a) => (classId ? a.classId === classId : true))
      .sort((a, b) => b.createdAt - a.createdAt)

    if (!studentId) return list.map((a) => ({ ...a }))

    // attach submission status
    return list.map((a) => {
      const sub = db.submissions.find(
        (s) => s.assignmentId === a.id && s.studentId === studentId,
      )
      return {
        ...a,
        submission: sub ? { ...sub } : null,
      }
    })
  },

  async createAssignment({ classId, subject, title, description, dueAt, pointsReward, createdBy }) {
    await delay(500)
    ensureSeed()

    const assignment = {
      id: uid('as'),
      classId,
      subject,
      title,
      description,
      dueAt,
      pointsReward,
      createdBy,
      createdAt: Date.now(),
    }

    db.assignments = [assignment, ...db.assignments]
    return { ...assignment }
  },

  async submitAssignment({ assignmentId, studentId, content }) {
    await delay(500)
    ensureSeed()

    const assignment = db.assignments.find((a) => a.id === assignmentId)
    if (!assignment) {
      const err = new Error('Không tìm thấy bài tập')
      err.code = 'NOT_FOUND'
      throw err
    }

    const existingIndex = db.submissions.findIndex(
      (s) => s.assignmentId === assignmentId && s.studentId === studentId,
    )

    const submission = {
      id: uid('sub'),
      assignmentId,
      studentId,
      classId: assignment.classId,
      content,
      submittedAt: Date.now(),
      status: 'SUBMITTED',
      earnedPoints: assignment.pointsReward,
    }

    if (existingIndex >= 0) {
      db.submissions[existingIndex] = submission
    } else {
      db.submissions.push(submission)
    }

    return { ...submission }
  },

  async listSubmissions(assignmentId) {
    await delay(500)
    ensureSeed()
    return db.submissions
      .filter((s) => s.assignmentId === assignmentId)
      .sort((a, b) => b.submittedAt - a.submittedAt)
      .map((s) => ({ ...s }))
  },
}
