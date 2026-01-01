/**
 * Test Service - Advanced exam system with anti-cheating features
 * Features:
 * - Multiple choice + Essay questions
 * - Time limit enforcement
 * - Tab switch tracking
 * - Auto-save every 30s
 * - Randomize questions per student
 * - Automatic grading for MCQ
 * - Cheating detection & analytics
 */

function delay(ms = 500) {
  return new Promise((res) => window.setTimeout(res, ms))
}

function uid(prefix = 'id') {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`
}

// In-memory database
const db = {
  tests: [],
  testAttempts: [], // student attempts with tracking
  testAnswers: [], // student answers
}

// Seed data
function ensureSeed() {
  if (db.tests.length) return

  db.tests = [
    {
      id: 'test_5A_1',
      classId: '5A',
      subject: 'Toán',
      title: 'Kiểm tra giữa kỳ - Phân số',
      description: 'Kiểm tra 15 phút. Làm bài cẩn thận, không được chuyển tab.',
      type: 'TEST', // TEST or EXAM
      duration: 15, // minutes
      totalPoints: 10,
      startAt: Date.now() - 1000 * 60 * 60 * 2, // started 2h ago
      endAt: Date.now() + 1000 * 60 * 60 * 24 * 2, // ends in 2 days
      randomizeQuestions: true,
      allowCopyPaste: false,
      requireWebcam: false,
      maxTabSwitches: 3,
      questions: [
        {
          id: 'q1',
          type: 'MULTIPLE_CHOICE',
          question: '2/3 + 1/3 = ?',
          options: ['1', '3/6', '2/6', '3/3'],
          correctAnswer: 0, // index
          points: 2,
        },
        {
          id: 'q2',
          type: 'MULTIPLE_CHOICE',
          question: '5/4 - 1/4 = ?',
          options: ['4/4', '6/4', '4/0', '1'],
          correctAnswer: 3,
          points: 2,
        },
        {
          id: 'q3',
          type: 'MULTIPLE_CHOICE',
          question: 'Phân số nào lớn hơn: 2/3 hay 3/4?',
          options: ['2/3', '3/4', 'Bằng nhau', 'Không so sánh được'],
          correctAnswer: 1,
          points: 2,
        },
        {
          id: 'q4',
          type: 'ESSAY',
          question: 'Giải thích cách so sánh hai phân số có mẫu số khác nhau. Lấy ví dụ minh họa.',
          points: 4,
          minWords: 30,
        },
      ],
      createdBy: 'gv1',
      createdAt: Date.now() - 1000 * 60 * 60 * 24,
    },
    {
      id: 'test_5A_2',
      classId: '5A',
      subject: 'Tiếng Việt',
      title: 'Kiểm tra đọc hiểu',
      description: 'Thời gian: 30 phút. Đọc kỹ đoạn văn trước khi trả lời.',
      type: 'TEST',
      duration: 30,
      totalPoints: 10,
      startAt: Date.now() + 1000 * 60 * 60 * 24, // starts tomorrow
      endAt: Date.now() + 1000 * 60 * 60 * 24 * 3,
      randomizeQuestions: false,
      allowCopyPaste: false,
      requireWebcam: false,
      maxTabSwitches: 2,
      questions: [
        {
          id: 'q1',
          type: 'MULTIPLE_CHOICE',
          question: 'Đoạn văn chủ yếu nói về điều gì?',
          options: ['Thiên nhiên', 'Gia đình', 'Học tập', 'Bạn bè'],
          correctAnswer: 1,
          points: 2.5,
        },
        {
          id: 'q2',
          type: 'MULTIPLE_CHOICE',
          question: 'Thông điệp của tác giả là gì?',
          options: ['Chăm học', 'Hiếu thảo', 'Trung thực', 'Dũng cảm'],
          correctAnswer: 1,
          points: 2.5,
        },
        {
          id: 'q3',
          type: 'ESSAY',
          question: 'Em học được gì từ đoạn văn? Viết 5-7 câu.',
          points: 5,
          minWords: 50,
        },
      ],
      createdBy: 'gv1',
      createdAt: Date.now() - 1000 * 60 * 60 * 12,
    },
  ]
}

export const testService = {
  /**
   * List all tests for a class or student
   */
  async listTests({ classId, studentId } = {}) {
    await delay(400)
    ensureSeed()

    let list = db.tests
      .filter((t) => (classId ? t.classId === classId : true))
      .sort((a, b) => b.createdAt - a.createdAt)

    if (!studentId) return list.map((t) => ({ ...t }))

    // Attach attempt status for student
    return list.map((t) => {
      const attempt = db.testAttempts.find(
        (a) => a.testId === t.id && a.studentId === studentId,
      )
      return {
        ...t,
        attempt: attempt ? { ...attempt } : null,
      }
    })
  },

  /**
   * Get test details (for taking test)
   */
  async getTest(testId) {
    await delay(300)
    ensureSeed()

    const test = db.tests.find((t) => t.id === testId)
    if (!test) {
      throw new Error('Không tìm thấy bài kiểm tra')
    }

    return { ...test }
  },

  /**
   * Create new test
   */
  async createTest({
    classId,
    subject,
    title,
    description,
    type,
    duration,
    startAt,
    endAt,
    randomizeQuestions,
    allowCopyPaste,
    requireWebcam,
    maxTabSwitches,
    questions,
    createdBy,
  }) {
    await delay(500)
    ensureSeed()

    const totalPoints = questions.reduce((sum, q) => sum + (q.points || 0), 0)

    const test = {
      id: uid('test'),
      classId,
      subject,
      title,
      description,
      type: type || 'TEST',
      duration,
      totalPoints,
      startAt,
      endAt,
      randomizeQuestions: randomizeQuestions ?? true,
      allowCopyPaste: allowCopyPaste ?? false,
      requireWebcam: requireWebcam ?? false,
      maxTabSwitches: maxTabSwitches ?? 3,
      questions,
      createdBy,
      createdAt: Date.now(),
    }

    db.tests.push(test)
    return { ...test }
  },

  /**
   * Start test attempt (student begins test)
   */
  async startTestAttempt({ testId, studentId }) {
    await delay(300)
    ensureSeed()

    const test = db.tests.find((t) => t.id === testId)
    if (!test) throw new Error('Không tìm thấy bài kiểm tra')

    // Check if already started
    const existing = db.testAttempts.find(
      (a) => a.testId === testId && a.studentId === studentId,
    )
    if (existing) {
      // Return existing attempt (allow continue)
      return { ...existing }
    }

    // Check time window
    const now = Date.now()
    if (now < test.startAt) {
      throw new Error('Bài kiểm tra chưa bắt đầu')
    }
    if (now > test.endAt) {
      throw new Error('Bài kiểm tra đã kết thúc')
    }

    // Randomize questions if enabled
    const questions = test.randomizeQuestions
      ? [...test.questions].sort(() => Math.random() - 0.5)
      : test.questions

    const attempt = {
      id: uid('attempt'),
      testId,
      studentId,
      classId: test.classId,
      startedAt: Date.now(),
      endAt: Date.now() + test.duration * 60 * 1000,
      status: 'IN_PROGRESS',
      questions: questions.map((q) => ({ ...q })),
      tracking: {
        tabSwitches: 0,
        copyAttempts: 0,
        pasteAttempts: 0,
        suspiciousActivities: [],
        lastActive: Date.now(),
      },
    }

    db.testAttempts.push(attempt)
    return { ...attempt }
  },

  /**
   * Get current attempt (for student taking test)
   */
  async getAttempt(attemptId) {
    await delay(200)
    ensureSeed()

    const attempt = db.testAttempts.find((a) => a.id === attemptId)
    if (!attempt) throw new Error('Không tìm thấy bài làm')

    return { ...attempt }
  },

  /**
   * Track suspicious activity
   */
  async trackActivity({ attemptId, type, details }) {
    await delay(100)
    ensureSeed()

    const attempt = db.testAttempts.find((a) => a.id === attemptId)
    if (!attempt) throw new Error('Không tìm thấy bài làm')

    const activity = {
      type, // TAB_SWITCH, COPY_ATTEMPT, PASTE_ATTEMPT, etc.
      details,
      timestamp: Date.now(),
    }

    if (type === 'TAB_SWITCH') {
      attempt.tracking.tabSwitches++
    } else if (type === 'COPY_ATTEMPT') {
      attempt.tracking.copyAttempts++
    } else if (type === 'PASTE_ATTEMPT') {
      attempt.tracking.pasteAttempts++
    }

    attempt.tracking.suspiciousActivities.push(activity)
    attempt.tracking.lastActive = Date.now()

    return { success: true, tracking: { ...attempt.tracking } }
  },

  /**
   * Save answer (auto-save every 30s or on answer change)
   */
  async saveAnswer({ attemptId, questionId, answer }) {
    await delay(150)
    ensureSeed()

    const attempt = db.testAttempts.find((a) => a.id === attemptId)
    if (!attempt) throw new Error('Không tìm thấy bài làm')

    // Check if time is up
    if (Date.now() > attempt.endAt) {
      throw new Error('Hết thời gian làm bài')
    }

    const existingIndex = db.testAnswers.findIndex(
      (ans) => ans.attemptId === attemptId && ans.questionId === questionId,
    )

    const answerRecord = {
      id: uid('ans'),
      attemptId,
      questionId,
      answer,
      savedAt: Date.now(),
    }

    if (existingIndex >= 0) {
      db.testAnswers[existingIndex] = answerRecord
    } else {
      db.testAnswers.push(answerRecord)
    }

    attempt.tracking.lastActive = Date.now()

    return { success: true }
  },

  /**
   * Submit test (finish and grade)
   */
  async submitTest({ attemptId, force = false }) {
    await delay(500)
    ensureSeed()

    const attempt = db.testAttempts.find((a) => a.id === attemptId)
    if (!attempt) throw new Error('Không tìm thấy bài làm')

    const test = db.tests.find((t) => t.id === attempt.testId)
    if (!test) throw new Error('Không tìm thấy đề bài')

    // Check if already submitted
    if (attempt.status === 'SUBMITTED') {
      return { ...attempt }
    }

    // Auto-grade multiple choice
    let earnedPoints = 0
    const answers = db.testAnswers.filter((ans) => ans.attemptId === attemptId)

    const gradedQuestions = attempt.questions.map((q) => {
      const studentAnswer = answers.find((ans) => ans.questionId === q.id)

      if (q.type === 'MULTIPLE_CHOICE') {
        const isCorrect =
          studentAnswer && studentAnswer.answer === q.correctAnswer
        const pointsEarned = isCorrect ? q.points : 0
        earnedPoints += pointsEarned

        return {
          ...q,
          studentAnswer: studentAnswer?.answer ?? null,
          isCorrect,
          pointsEarned,
          gradedAt: Date.now(),
        }
      } else {
        // Essay - needs manual grading
        return {
          ...q,
          studentAnswer: studentAnswer?.answer ?? '',
          isCorrect: null,
          pointsEarned: 0, // will be graded by teacher
          gradedAt: null,
        }
      }
    })

    attempt.status = 'SUBMITTED'
    attempt.submittedAt = Date.now()
    attempt.earnedPoints = earnedPoints
    attempt.gradedQuestions = gradedQuestions
    attempt.needsManualGrading = gradedQuestions.some(
      (q) => q.type === 'ESSAY',
    )

    // Cheating detection flags
    attempt.cheatingFlags = []
    if (attempt.tracking.tabSwitches > test.maxTabSwitches) {
      attempt.cheatingFlags.push({
        type: 'EXCESSIVE_TAB_SWITCHES',
        severity: 'HIGH',
        message: `Chuyển tab ${attempt.tracking.tabSwitches} lần (giới hạn: ${test.maxTabSwitches})`,
      })
    }
    if (attempt.tracking.copyAttempts > 0) {
      attempt.cheatingFlags.push({
        type: 'COPY_ATTEMPTS',
        severity: 'MEDIUM',
        message: `Thử copy ${attempt.tracking.copyAttempts} lần`,
      })
    }

    // Calculate completion time
    const timeSpent = Math.round((attempt.submittedAt - attempt.startedAt) / 1000) // seconds
    const expectedTime = test.duration * 60
    if (timeSpent < expectedTime * 0.3) {
      attempt.cheatingFlags.push({
        type: 'TOO_FAST',
        severity: 'MEDIUM',
        message: `Hoàn thành quá nhanh (${Math.round(timeSpent / 60)} phút / ${test.duration} phút)`,
      })
    }

    return { ...attempt }
  },

  /**
   * Get all submissions for a test (teacher view)
   */
  async getTestSubmissions(testId) {
    await delay(400)
    ensureSeed()

    const submissions = db.testAttempts
      .filter((a) => a.testId === testId)
      .sort((a, b) => (b.submittedAt || 0) - (a.submittedAt || 0))
      .map((a) => ({ ...a }))

    return submissions
  },

  /**
   * Manual grade essay question
   */
  async gradeEssay({ attemptId, questionId, points, feedback }) {
    await delay(300)
    ensureSeed()

    const attempt = db.testAttempts.find((a) => a.id === attemptId)
    if (!attempt) throw new Error('Không tìm thấy bài làm')

    const question = attempt.gradedQuestions?.find((q) => q.id === questionId)
    if (!question) throw new Error('Không tìm thấy câu hỏi')

    question.pointsEarned = points
    question.feedback = feedback
    question.gradedAt = Date.now()
    question.isCorrect = points > 0

    // Recalculate total
    attempt.earnedPoints = attempt.gradedQuestions.reduce(
      (sum, q) => sum + (q.pointsEarned || 0),
      0,
    )

    attempt.needsManualGrading = attempt.gradedQuestions.some(
      (q) => q.type === 'ESSAY' && !q.gradedAt,
    )

    return { success: true, attempt: { ...attempt } }
  },

  /**
   * Get test analytics (for teacher)
   */
  async getTestAnalytics(testId) {
    await delay(400)
    ensureSeed()

    const test = db.tests.find((t) => t.id === testId)
    if (!test) throw new Error('Không tìm thấy bài kiểm tra')

    const attempts = db.testAttempts.filter((a) => a.testId === testId)
    const submitted = attempts.filter((a) => a.status === 'SUBMITTED')

    if (submitted.length === 0) {
      return {
        testId,
        totalAttempts: attempts.length,
        submitted: 0,
        inProgress: attempts.length,
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0,
        averageTime: 0,
        cheatingFlags: 0,
        needsGrading: 0,
        questionStats: [],
      }
    }

    const scores = submitted.map((a) => a.earnedPoints || 0)
    const times = submitted.map((a) => (a.submittedAt - a.startedAt) / 60000) // minutes

    const questionStats = test.questions.map((q, idx) => {
      const answers = submitted.map((a) => a.gradedQuestions?.[idx])
      const correct = answers.filter((a) => a?.isCorrect).length
      const total = answers.filter((a) => a?.studentAnswer != null).length

      return {
        questionId: q.id,
        question: q.question,
        type: q.type,
        correctRate: total > 0 ? (correct / total) * 100 : 0,
        totalAnswers: total,
      }
    })

    return {
      testId,
      totalAttempts: attempts.length,
      submitted: submitted.length,
      inProgress: attempts.filter((a) => a.status === 'IN_PROGRESS').length,
      averageScore:
        scores.reduce((a, b) => a + b, 0) / scores.length,
      highestScore: Math.max(...scores),
      lowestScore: Math.min(...scores),
      averageTime: times.reduce((a, b) => a + b, 0) / times.length,
      cheatingFlags: submitted.filter((a) => a.cheatingFlags?.length > 0)
        .length,
      needsGrading: submitted.filter((a) => a.needsManualGrading).length,
      questionStats,
    }
  },

  /**
   * Delete test (teacher only)
   */
  async deleteTest(testId) {
    await delay(300)
    ensureSeed()

    const index = db.tests.findIndex((t) => t.id === testId)
    if (index < 0) throw new Error('Không tìm thấy bài kiểm tra')

    db.tests.splice(index, 1)

    // Clean up related data
    db.testAttempts = db.testAttempts.filter((a) => a.testId !== testId)
    db.testAnswers = db.testAnswers.filter((ans) => {
      const attempt = db.testAttempts.find((a) => a.id === ans.attemptId)
      return attempt && attempt.testId !== testId
    })

    return { success: true }
  },
}
