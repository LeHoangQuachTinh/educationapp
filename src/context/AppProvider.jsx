import React, { useCallback, useMemo, useReducer } from 'react'
import { uid } from '../components/ui/helpers'
import { buildInitialData, findLesson, ROLES } from './mockData'

export const AppContext = React.createContext(null)

function reducer(state, action) {
  switch (action.type) {
    case 'SET_ROLE':
      return { ...state, currentRole: action.role }

    case 'SET_CURRENT_STUDENT':
      return { ...state, currentStudentId: action.studentId }

    case 'MOVE_SEAT': {
      const { studentId, x, y } = action
      return {
        ...state,
        seating: {
          ...state.seating,
          positions: { ...state.seating.positions, [studentId]: { x, y } },
        },
      }
    }

    case 'SET_ATTENDANCE_STATUS': {
      const { studentId, status } = action
      return {
        ...state,
        students: state.students.map((s) =>
          s.id === studentId
            ? {
                ...s,
                attendance: {
                  ...s.attendance,
                  lastStatus: status,
                  presentDays:
                    status === 'present'
                      ? s.attendance.presentDays + 1
                      : s.attendance.presentDays,
                  absentDays:
                    status === 'absent'
                      ? s.attendance.absentDays + 1
                      : s.attendance.absentDays,
                },
              }
            : s,
        ),
      }
    }

    case 'ADD_POINTS': {
      const { studentId, delta, category, reason } = action
      return {
        ...state,
        students: state.students.map((s) => {
          if (s.id !== studentId) return s
          const next = {
            ...s,
            points: {
              ...s.points,
              balance: Math.max(0, (s.points.balance || 0) + delta),
              [category]: Math.max(0, (s.points?.[category] || 0) + delta),
            },
          }
          return next
        }),
        pointEvents: [
          {
            id: uid('pe'),
            studentId,
            delta,
            category,
            reason,
            ts: Date.now(),
          },
          ...state.pointEvents,
        ],
      }
    }

    case 'BUY_ITEM': {
      const { studentId, itemId } = action
      const item = state.storeItems.find((i) => i.id === itemId)
      if (!item) return state
      const student = state.students.find((s) => s.id === studentId)
      if (!student) return state
      if (student.points.balance < item.cost) return state

      const already = state.inventoryByStudent?.[studentId] || []
      return {
        ...state,
        students: state.students.map((s) =>
          s.id === studentId
            ? {
                ...s,
                points: {
                  ...s.points,
                  balance: Math.max(0, s.points.balance - item.cost),
                },
              }
            : s,
        ),
        inventoryByStudent: {
          ...state.inventoryByStudent,
          [studentId]: [...already, itemId],
        },
      }
    }

    case 'UPSERT_LESSON': {
      // payload: week, subjectId, lesson (id?, title, objective, content)
      const { week, subjectId, lesson } = action
      return {
        ...state,
        syllabus: {
          ...state.syllabus,
          weeks: state.syllabus.weeks.map((w) => {
            if (w.week !== week) return w
            return {
              ...w,
              subjects: w.subjects.map((sub) => {
                if (sub.id !== subjectId) return sub
                const exists = sub.lessons.some((l) => l.id === lesson.id)
                return {
                  ...sub,
                  lessons: exists
                    ? sub.lessons.map((l) => (l.id === lesson.id ? { ...l, ...lesson } : l))
                    : [...sub.lessons, { ...lesson, id: lesson.id || uid('lesson') }],
                }
              }),
            }
          }),
        },
      }
    }

    case 'DELETE_LESSON': {
      const { week, subjectId, lessonId } = action
      return {
        ...state,
        syllabus: {
          ...state.syllabus,
          weeks: state.syllabus.weeks.map((w) => {
            if (w.week !== week) return w
            return {
              ...w,
              subjects: w.subjects.map((sub) =>
                sub.id === subjectId
                  ? { ...sub, lessons: sub.lessons.filter((l) => l.id !== lessonId) }
                  : sub,
              ),
            }
          }),
        },
      }
    }

    case 'SET_SCHEDULE_CELL': {
      const { dayIndex, slotIndex, subjectId, lessonId } = action
      const key = `${dayIndex}_${slotIndex}`
      return {
        ...state,
        schedule: {
          ...state.schedule,
          cells: {
            ...state.schedule.cells,
            [key]: subjectId && lessonId ? { subjectId, lessonId } : undefined,
          },
        },
      }
    }

    case 'SAVE_LOGBOOK_ENTRY': {
      const { week, dayIndex, slotIndex, entry } = action
      const key = `${week}_${dayIndex}_${slotIndex}`
      return {
        ...state,
        logbook: {
          ...state.logbook,
          entries: {
            ...state.logbook.entries,
            [key]: {
              ...(state.logbook.entries[key] || {}),
              ...entry,
            },
          },
        },
      }
    }

    case 'ADD_ANNOUNCEMENT': {
      return {
        ...state,
        announcements: [
          {
            id: uid('feed'),
            author: action.author,
            title: action.title,
            content: action.content,
            createdAt: Date.now(),
          },
          ...state.announcements,
        ],
      }
    }

    case 'SEND_MESSAGE': {
      const { studentId, from, text } = action
      const thread = state.chatThreads[studentId] || {
        participantParent: 'Phụ huynh',
        messages: [],
      }
      return {
        ...state,
        chatThreads: {
          ...state.chatThreads,
          [studentId]: {
            ...thread,
            messages: [
              ...thread.messages,
              { id: uid('msg'), from, text, ts: Date.now() },
            ],
          },
        },
      }
    }

    case 'ADD_TOAST': {
      return {
        ...state,
        toasts: [...state.toasts, action.toast],
      }
    }

    case 'DISMISS_TOAST': {
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.id),
      }
    }

    default:
      return state
  }
}

const initialState = { ...buildInitialData(), toasts: [] }

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  const setRole = useCallback((role) => dispatch({ type: 'SET_ROLE', role }), [])
  const setCurrentStudent = useCallback(
    (studentId) => dispatch({ type: 'SET_CURRENT_STUDENT', studentId }),
    [],
  )

  const toast = useCallback((title, message, type = 'success') => {
    const id = uid('toast')
    dispatch({
      type: 'ADD_TOAST',
      toast: { id, title, message, type },
    })
    window.setTimeout(() => dispatch({ type: 'DISMISS_TOAST', id }), 3500)
  }, [])

  const dismissToast = useCallback((id) => dispatch({ type: 'DISMISS_TOAST', id }), [])

  const addPoints = useCallback(
    ({ studentId, delta, category, reason }) => {
      dispatch({ type: 'ADD_POINTS', studentId, delta, category, reason })
      toast('Cập nhật điểm', `${delta > 0 ? '+' : ''}${delta} điểm – ${reason}`, delta >= 0 ? 'success' : 'danger')
    },
    [toast],
  )

  const setAttendanceStatus = useCallback(
    ({ studentId, status }) => {
      dispatch({ type: 'SET_ATTENDANCE_STATUS', studentId, status })
      toast(
        'Điểm danh',
        `${status === 'present' ? 'Có mặt' : 'Vắng'}: ${state.students.find((s) => s.id === studentId)?.fullName || ''}`,
        status === 'present' ? 'success' : 'danger',
      )
    },
    [state.students, toast],
  )

  const moveSeat = useCallback(
    ({ studentId, x, y }) => {
      dispatch({ type: 'MOVE_SEAT', studentId, x, y })
      toast('Sơ đồ lớp', 'Đã đổi chỗ ngồi.', 'info')
    },
    [toast],
  )

  const buyItem = useCallback(
    ({ studentId, itemId }) => {
      const item = state.storeItems.find((i) => i.id === itemId)
      if (!item) return
      const student = state.students.find((s) => s.id === studentId)
      if (!student) return
      if (student.points.balance < item.cost) {
        toast('Không đủ điểm', 'Cần thêm điểm để mua vật phẩm này.', 'danger')
        return
      }
      dispatch({ type: 'BUY_ITEM', studentId, itemId })
      toast('Mua thành công', `Đã mua: ${item.name} (-${item.cost} điểm)`, 'success')
    },
    [state.storeItems, state.students, toast],
  )

  const upsertLesson = useCallback(
    ({ week, subjectId, lesson }) => {
      dispatch({ type: 'UPSERT_LESSON', week, subjectId, lesson })
      toast('Giáo án', 'Đã lưu bài học trong Kế hoạch bài dạy.', 'success')
    },
    [toast],
  )

  const deleteLesson = useCallback(
    ({ week, subjectId, lessonId }) => {
      dispatch({ type: 'DELETE_LESSON', week, subjectId, lessonId })
      toast('Giáo án', 'Đã xoá bài học.', 'danger')
    },
    [toast],
  )

  const saveLogbookEntry = useCallback(
    ({ week, dayIndex, slotIndex, entry }) => {
      dispatch({ type: 'SAVE_LOGBOOK_ENTRY', week, dayIndex, slotIndex, entry })
      toast('Sổ đầu bài', 'Đã lưu sổ đầu bài.', 'success')
    },
    [toast],
  )

  const signAndSubmitLogbook = useCallback(
    ({ week, dayIndex, slotIndex, entry }) => {
      dispatch({
        type: 'SAVE_LOGBOOK_ENTRY',
        week,
        dayIndex,
        slotIndex,
        entry: {
          ...entry,
          status: 'completed',
          signedBy: 'Cô Hoa',
          submittedAt: Date.now(),
        },
      })
      toast('Sổ đầu bài', 'Đã ký & nộp. Trạng thái: Hoàn thành.', 'success')
    },
    [toast],
  )

  const addAnnouncement = useCallback(
    ({ title, content }) => {
      dispatch({ type: 'ADD_ANNOUNCEMENT', author: 'Cô Hoa', title, content })
      toast('Bảng tin', 'Đã đăng thông báo mới.', 'success')
    },
    [toast],
  )

  const sendMessage = useCallback(
    ({ studentId, from, text }) => {
      dispatch({ type: 'SEND_MESSAGE', studentId, from, text })
    },
    [],
  )

  const generateSlides = useCallback(async ({ subjectId, lessonId }) => {
    const found = findLesson(state.syllabus, subjectId, lessonId)
    if (!found) return null

    // simulate AI delay
    await new Promise((res) => window.setTimeout(res, 1200 + Math.random() * 1200))

    const { subject, lesson } = found
    const title = `✨ Slide bài học: ${lesson.title}`

    const slides = [
      {
        type: 'title',
        heading: lesson.title,
        sub: `${subject.name} · Tuần ${state.schedule.week}`,
        bullets: ['Mục tiêu: ' + lesson.objective],
      },
      {
        type: 'theory',
        heading: 'Kiến thức trọng tâm',
        bullets: [
          'Tóm tắt: ' + lesson.content,
          'Từ khoá: ví dụ minh hoạ / câu hỏi gợi mở / ví dụ gần gũi',
        ],
      },
      {
        type: 'activity',
        heading: 'Hoạt động lớp (5–10 phút)',
        bullets: [
          'Trò chơi nhanh: “Ai đúng trước?” (3 câu hỏi)',
          'Thảo luận cặp đôi: 2 phút, chia sẻ 1 ý',
          'Chốt kiến thức bằng ví dụ của học sinh',
        ],
      },
      {
        type: 'homework',
        heading: 'Bài tập về nhà',
        bullets: [
          'Làm 5 bài trong vở bài tập (mức độ tăng dần).',
          'Chuẩn bị 1 ví dụ thực tế liên quan đến bài học để chia sẻ.' ,
        ],
      },
    ]

    toast('AI Slides', 'Đã tạo bản xem trước slide.', 'success')
    return { title, slides, meta: { subjectId, lessonId } }
  }, [state.syllabus, state.schedule.week, toast])

  const selectors = useMemo(() => {
    const studentById = Object.fromEntries(state.students.map((s) => [s.id, s]))

    function getLessonLabelForCell(dayIndex, slotIndex) {
      const key = `${dayIndex}_${slotIndex}`
      const ref = state.schedule.cells[key]
      if (!ref) return null
      const found = findLesson(state.syllabus, ref.subjectId, ref.lessonId)
      if (!found) return null
      return {
        subjectName: found.subject.name,
        lessonTitle: found.lesson.title,
        lesson: found.lesson,
        subject: found.subject,
      }
    }

    function getLogbookEntry(week, dayIndex, slotIndex) {
      const key = `${week}_${dayIndex}_${slotIndex}`
      return state.logbook.entries[key] || null
    }

    return { studentById, getLessonLabelForCell, getLogbookEntry }
  }, [state.students, state.schedule.cells, state.syllabus, state.logbook.entries])

  const value = useMemo(
    () => ({
      state,
      actions: {
        setRole,
        setCurrentStudent,
        moveSeat,
        addPoints,
        setAttendanceStatus,
        upsertLesson,
        deleteLesson,
        saveLogbookEntry,
        signAndSubmitLogbook,
        addAnnouncement,
        sendMessage,
        buyItem,
        generateSlides,
        toast,
        dismissToast,
      },
      selectors,
      ROLES,
    }),
    [
      state,
      setRole,
      setCurrentStudent,
      moveSeat,
      addPoints,
      setAttendanceStatus,
      upsertLesson,
      deleteLesson,
      saveLogbookEntry,
      signAndSubmitLogbook,
      addAnnouncement,
      sendMessage,
      buyItem,
      generateSlides,
      toast,
      dismissToast,
      selectors,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = React.useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}

export { ROLES }
