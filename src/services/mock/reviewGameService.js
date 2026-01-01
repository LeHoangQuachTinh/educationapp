import { syllabusService } from './syllabusService'
import { reviewProgressStore } from './reviewProgressStore'

function delay(ms = 450) {
  return new Promise((res) => window.setTimeout(res, ms))
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n))
}

function weekdayIndex(date = new Date()) {
  const d = new Date(date)
  const day = d.getDay() // 0 Sun ... 6 Sat
  // Mon-Fri => 0..4; weekend fallback => Monday
  if (day === 0 || day === 6) return 0
  return day - 1
}

function dateLabelFor(dayIdx) {
  const map = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6']
  return `Hôm nay (${map[clamp(dayIdx, 0, 4)]})`
}

function tokenize(text) {
  return (text || '')
    .replace(/[“”"'.,:;()\-]/g, ' ')
    .split(/\s+/)
    .map((t) => t.trim())
    .filter(Boolean)
}

function pickN(arr, n) {
  const copy = [...arr]
  // simple shuffle
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy.slice(0, n)
}

function makeMiniGame({ subjectId, subjectName, lesson, keywords }) {
  const kw = keywords

  // Common helper: safe choices
  function choicesWithAnswer(answer) {
    const pool = kw.filter((x) => x !== answer)
    const distractors = pickN(pool.length ? pool : ['học', 'vui', 'nhớ', 'đúng'], 2)
    return pickN([answer, ...distractors], 3)
  }

  // Math quick: simple arithmetic + keyword hook (best-effort)
  if (subjectId === 'sub_toan') {
    const rounds = Array.from({ length: 5 }).map((_, i) => {
      // small numbers for grade 1-5
      const a = 2 + ((i * 3) % 8)
      const b = 1 + ((i * 5) % 7)
      const op = i % 2 === 0 ? '+' : '-'
      const ans = op === '+' ? a + b : a - b
      const answer = String(ans)
      const choices = pickN([
        answer,
        String(ans + 1),
        String(ans - 1),
        String(ans + 2),
      ], 3)

      return {
        id: `m_${lesson.id}_${i}`,
        prompt: `Tính nhanh: ${a} ${op} ${b} = ?`,
        answer,
        choices,
      }
    })

    return {
      key: 'mathQuick',
      type: 'mcq',
      title: `Tính nhanh (${subjectName})`,
      rounds,
    }
  }

  // Vietnamese cloze: remove a keyword from objective/content
  if (subjectId === 'sub_tv') {
    const text = `${lesson.objective || ''}. ${lesson.content || ''}`.trim()
    const pick = kw.find((w) => w.length >= 4) || 'câu'
    const sentence = text || `Bài ${lesson.title} giúp em kể chuyện rõ ràng hơn.`

    const masked = sentence.replace(new RegExp(pick, 'i'), '____')
    return {
      key: 'vietCloze',
      type: 'mcq',
      title: `Điền từ (${subjectName})`,
      rounds: [
        {
          id: `v_${lesson.id}_0`,
          prompt: masked,
          answer: pick,
          choices: choicesWithAnswer(pick),
        },
      ],
    }
  }

  // Science pairs: memory / matching 2 cards
  if (subjectId === 'sub_kh') {
    const defRaw = (lesson.content || lesson.objective || '').split(';').map((s) => s.trim()).filter(Boolean)
    const terms = pickN(kw.length ? kw : ['phổi', 'oxy', 'hô hấp'], 3)

    const pairs = terms.map((t, idx) => ({
      pairId: `p_${lesson.id}_${idx}`,
      term: t,
      def: defRaw[idx] || defRaw[0] || `Khái niệm liên quan đến “${t}”.`,
    }))

    const cards = pickN(
      pairs.flatMap((p) => [
        { id: `${p.pairId}_t`, pairId: p.pairId, kind: 'term', text: p.term },
        { id: `${p.pairId}_d`, pairId: p.pairId, kind: 'def', text: p.def },
      ]),
      pairs.length * 2,
    )

    return {
      key: 'sciencePairs',
      type: 'pairs',
      title: `Ghép cặp 2 thẻ (${subjectName})`,
      cards,
      pairsTotal: pairs.length,
    }
  }

  return null
}

function buildQuestionsFromLesson({ subjectId, subjectName, lesson }) {
  // Heuristic-based generation (no real AI):
  // - Flashcards from objective/content snippets
  // - TF statements from key phrases
  // - MCQ from keyword selection

  const content = `${lesson.title}. ${lesson.objective || ''}. ${lesson.content || ''}`
  const words = tokenize(content)

  const keywords = Array.from(
    new Set(
      words
        .filter((w) => w.length >= 4)
        .map((w) => w.toLowerCase())
        .filter((w) => !['của', 'và', 'trong', 'được', 'bằng', 'theo', 'cách', 'một', 'nhiều', 'giúp', 'cho', 'cần', 'biết', 'luyện'].includes(w)),
    ),
  )

  const kw = pickN(keywords, 8)

  const flashcards = [
    {
      id: `fc_${lesson.id}_1`,
      front: `Mục tiêu bài ${subjectName}`,
      back: lesson.objective || 'Ôn lại bài học và ghi nhớ ý chính.',
    },
    {
      id: `fc_${lesson.id}_2`,
      front: `Nội dung chính: ${lesson.title}`,
      back: lesson.content || 'Ôn lại kiến thức trọng tâm trong tiết học.',
    },
  ]

  const tf = kw.slice(0, 3).map((k, idx) => ({
    id: `tf_${lesson.id}_${idx}`,
    statement: `Trong bài hôm nay có nhắc đến “${k}”.`,
    answer: true,
  }))

  // Add a couple false statements
  tf.push({
    id: `tf_${lesson.id}_x1`,
    statement: `Bài “${lesson.title}” là bài học của môn Thể dục.`,
    answer: false,
  })

  const quiz = []
  if (kw.length >= 3) {
    for (let i = 0; i < Math.min(3, kw.length); i++) {
      const answer = kw[i]
      const distractors = pickN(kw.filter((x) => x !== answer), 2)
      quiz.push({
        id: `q_${lesson.id}_${i}`,
        q: `Từ khóa nào liên quan đến bài “${lesson.title}”?`,
        choices: pickN([answer, ...distractors], 3),
        answer,
      })
    }
  } else {
    quiz.push({
      id: `q_${lesson.id}_fallback`,
      q: `Bài hôm nay thuộc môn nào?`,
      choices: pickN([subjectName, 'Âm nhạc', 'Mỹ thuật'], 3),
      answer: subjectName,
    })
  }

  const mini = makeMiniGame({ subjectId, subjectName, lesson, keywords: kw })

  return { flashcards, tf, quiz, mini }
}

function mergePacks(packs) {
  const topics = packs.map((p) => `${p.subjectName}: ${p.lesson.title}`)

  const minis = packs.map((p) => p.mini).filter(Boolean)

  return {
    topics,
    quiz: {
      title: 'Quiz nhanh: Ôn bài hôm nay',
      questions: packs.flatMap((p) => p.quiz).slice(0, 6),
    },
    flashcards: packs.flatMap((p) => p.flashcards).slice(0, 8),
    tf: packs.flatMap((p) => p.tf).slice(0, 8),
    // For "All": pick first available mini as representative
    mini: minis[0] || null,
    bySubject: packs.reduce((acc, p) => {
      acc[p.subjectId] = {
        subjectId: p.subjectId,
        subjectName: p.subjectName,
        lesson: p.lesson,
        quiz: p.quiz,
        flashcards: p.flashcards,
        tf: p.tf,
        mini: p.mini || null,
      }
      return acc
    }, {}),
  }
}

export const reviewGameService = {
  async getDailyReview({ classId = '5A', studentId, date = new Date() } = {}) {
    await delay(450)

    const syllabus = await syllabusService.getSyllabus(classId)
    const dayIndex = weekdayIndex(date)

    // Collect all lessons assigned in schedule for dayIndex.
    const cells = syllabus?.schedule?.cells || {}
    const todays = Object.entries(cells)
      .filter(([key]) => key.startsWith(`${dayIndex}_`))
      .map(([, ref]) => ref)
      .filter(Boolean)

    const resolved = todays
      .map((ref) => {
        const subject = syllabus.subjects.find((s) => s.id === ref.subjectId)
        const lesson = subject?.lessons?.find((l) => l.id === ref.lessonId)
        if (!subject || !lesson) return null
        const generated = buildQuestionsFromLesson({ subjectId: subject.id, subjectName: subject.name, lesson })
        return {
          subjectId: subject.id,
          subjectName: subject.name,
          lesson,
          ...generated,
        }
      })
      .filter(Boolean)

    // Fallback: if schedule empty, use first lesson of first subject
    const packs = resolved.length
      ? resolved
      : (() => {
          const subject = syllabus.subjects[0]
          const lesson = subject?.lessons?.[0]
          if (!subject || !lesson) return []
          const generated = buildQuestionsFromLesson({ subjectId: subject.id, subjectName: subject.name, lesson })
          return [{ subjectId: subject.id, subjectName: subject.name, lesson, ...generated }]
        })()

    const dateKey = reviewProgressStore.todayKey(new Date(date))
    const progress = studentId ? await reviewProgressStore.getProgress({ studentId, dateKey }) : { completed: {} }

    return {
      dateKey,
      dateLabel: dateLabelFor(dayIndex),
      topics: mergePacks(packs).topics,
      pack: mergePacks(packs),
      progress,
    }
  },

  async completeMode({ studentId, dateKey, modeKey, score = 0, earned = 0 }) {
    if (!studentId || !dateKey || !modeKey) return null
    return reviewProgressStore.markCompleted({ studentId, dateKey, modeKey, score, earned })
  },
}
