function delay(ms = 500) {
  return new Promise((res) => window.setTimeout(res, ms))
}

function uid(prefix = 'id') {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`
}

// In-memory syllabus DB per class
const db = {
  byClass: new Map(), // classId -> syllabus
}

function seedForClass(classId) {
  if (db.byClass.has(classId)) return

  // Basic weekly plan (1 week) - can extend
  db.byClass.set(classId, {
    classId,
    schoolYear: '2025–2026',
    week: 12,
    subjects: [
      {
        id: 'sub_toan',
        name: 'Toán',
        lessons: [
          {
            id: 'l_toan_1',
            title: 'Phân số – So sánh và rút gọn',
            objective: 'Biết rút gọn và so sánh phân số bằng quy đồng.',
            content: 'Ôn phân số; rút gọn; quy đồng; bài tập tình huống.',
          },
          {
            id: 'l_toan_2',
            title: 'Bài toán có lời văn: Tỉ số',
            objective: 'Giải bài toán tỉ số bằng sơ đồ đoạn thẳng.',
            content: 'Mô hình hoá; chọn phép tính; trình bày lời giải.',
          },
        ],
      },
      {
        id: 'sub_tv',
        name: 'Tiếng Việt',
        lessons: [
          {
            id: 'l_tv_1',
            title: 'Tập làm văn: Kể chuyện sáng tạo',
            objective: 'Kể chuyện theo tranh, thêm chi tiết hợp lý.',
            content: 'Xây dựng nhân vật; mở đầu; kết thúc; luyện nói.',
          },
        ],
      },
      {
        id: 'sub_kh',
        name: 'Khoa học',
        lessons: [
          {
            id: 'l_kh_1',
            title: 'Hệ hô hấp: Bảo vệ phổi',
            objective: 'Hiểu vai trò phổi và thói quen tốt cho hô hấp.',
            content: 'Quan sát; thảo luận; mini game “Hít thở sâu”.',
          },
        ],
      },
    ],
    // timetable assignment (Mon-Fri x 5 periods)
    schedule: {
      days: ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6'],
      slots: [
        { id: 's1', label: 'Tiết 1', time: '07:30–08:10' },
        { id: 's2', label: 'Tiết 2', time: '08:15–08:55' },
        { id: 's3', label: 'Tiết 3', time: '09:10–09:50' },
        { id: 's4', label: 'Tiết 4', time: '10:00–10:40' },
        { id: 's5', label: 'Tiết 5', time: '10:45–11:25' },
      ],
      cells: {
        '0_0': { subjectId: 'sub_toan', lessonId: 'l_toan_1' },
        '0_1': { subjectId: 'sub_tv', lessonId: 'l_tv_1' },
        '1_0': { subjectId: 'sub_toan', lessonId: 'l_toan_2' },
        '2_2': { subjectId: 'sub_kh', lessonId: 'l_kh_1' },
      },
    },
  })
}

function findLesson(syllabus, subjectId, lessonId) {
  const subject = syllabus.subjects.find((s) => s.id === subjectId)
  if (!subject) return null
  const lesson = subject.lessons.find((l) => l.id === lessonId)
  if (!lesson) return null
  return { subject, lesson }
}

export const syllabusService = {
  async getSyllabus(classId) {
    await delay(500)
    seedForClass(classId)
    // deep-ish clone
    const s = db.byClass.get(classId)
    return {
      ...s,
      subjects: s.subjects.map((sub) => ({ ...sub, lessons: sub.lessons.map((l) => ({ ...l })) })),
      schedule: {
        ...s.schedule,
        days: [...s.schedule.days],
        slots: s.schedule.slots.map((x) => ({ ...x })),
        cells: { ...s.schedule.cells },
      },
    }
  },

  async upsertLesson({ classId, subjectId, lesson }) {
    await delay(500)
    seedForClass(classId)
    const s = db.byClass.get(classId)

    const subject = s.subjects.find((x) => x.id === subjectId)
    if (!subject) throw new Error('Không tìm thấy môn')

    const id = lesson.id || uid('lesson')
    const exists = subject.lessons.findIndex((l) => l.id === id)

    const nextLesson = { ...lesson, id }
    if (exists >= 0) subject.lessons[exists] = nextLesson
    else subject.lessons.push(nextLesson)

    return { ...nextLesson }
  },

  async deleteLesson({ classId, subjectId, lessonId }) {
    await delay(500)
    seedForClass(classId)
    const s = db.byClass.get(classId)
    const subject = s.subjects.find((x) => x.id === subjectId)
    if (!subject) throw new Error('Không tìm thấy môn')

    subject.lessons = subject.lessons.filter((l) => l.id !== lessonId)

    // remove from schedule if referenced
    for (const key of Object.keys(s.schedule.cells)) {
      const ref = s.schedule.cells[key]
      if (ref?.subjectId === subjectId && ref?.lessonId === lessonId) {
        delete s.schedule.cells[key]
      }
    }

    return true
  },

  async setScheduleCell({ classId, dayIndex, slotIndex, subjectId, lessonId }) {
    await delay(500)
    seedForClass(classId)
    const s = db.byClass.get(classId)

    const key = `${dayIndex}_${slotIndex}`
    if (!subjectId || !lessonId) {
      delete s.schedule.cells[key]
      return true
    }

    // validate
    const found = findLesson(s, subjectId, lessonId)
    if (!found) throw new Error('Không tìm thấy bài học')

    s.schedule.cells[key] = { subjectId, lessonId }
    return true
  },

  async generateSlides({ classId, subjectId, lessonId }) {
    // AI simulation delay
    await delay(1200)
    seedForClass(classId)
    const s = db.byClass.get(classId)
    const found = findLesson(s, subjectId, lessonId)
    if (!found) throw new Error('Không tìm thấy bài học')

    const { subject, lesson } = found

    const slides = [
      {
        type: 'title',
        heading: lesson.title,
        sub: `${subject.name} · ${s.classId} · Tuần ${s.week}`,
        bullets: ['Mục tiêu: ' + lesson.objective],
      },
      {
        type: 'theory',
        heading: 'Kiến thức trọng tâm',
        bullets: ['Tóm tắt: ' + lesson.content, 'Câu hỏi gợi mở: 2–3 câu'],
      },
      {
        type: 'activity',
        heading: 'Hoạt động lớp',
        bullets: ['Trò chơi nhanh 5 phút', 'Làm việc nhóm 2 người', 'Chốt kiến thức'],
      },
      {
        type: 'homework',
        heading: 'Bài tập về nhà',
        bullets: ['Làm 5 bài trong VBT', 'Chuẩn bị 1 ví dụ thực tế liên quan bài học'],
      },
    ]

    return {
      title: `✨ Slide bài học: ${lesson.title}`,
      slides,
    }
  },
}
