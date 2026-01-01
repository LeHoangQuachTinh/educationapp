import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Search, SendHorizonal } from 'lucide-react'

import PageHeader from '../../components/common/PageHeader'
import Badge from '../../components/common/Badge'

import { useTeacherClass } from '../../context/TeacherClassContext'
import { teacherService } from '../../services/mock/teacherService'
import { chatService } from '../../services/mock/chatService'

function Bubble({ mine, text, ts }) {
  return (
    <div className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
      <div
        className={
          'max-w-[82%] rounded-3xl px-3 py-2 text-sm ' +
          (mine ? 'bg-sky-600 text-white' : 'bg-white text-slate-800 border border-slate-100')
        }
      >
        <div>{text}</div>
        <div className={`mt-1 text-[10px] ${mine ? 'text-white/80' : 'text-slate-500'}`}>
          {new Date(ts).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  )
}

function parentNameFromStudent(stu) {
  // teacherService data doesn't include parent; in this prototype we derive a plausible label
  const first = (stu?.name || '').split(' ').slice(-1)[0] || 'HS'
  return `PH của ${first}`
}

export default function Messages() {
  const { currentClassId, currentClass } = useTeacherClass()

  const [loading, setLoading] = useState(true)
  const [students, setStudents] = useState([])
  const [q, setQ] = useState('')

  const [activeStudentId, setActiveStudentId] = useState(null)
  const [thread, setThread] = useState(null)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)

  const scrollerRef = useRef(null)

  async function loadList() {
    setLoading(true)
    const list = await teacherService.getClassList(currentClassId)

    // Ensure a thread participant label exists per student
    await Promise.all(
      list.map((stu) =>
        chatService.setParticipants({
          studentId: stu.id,
          teacherName: 'Cô Nguyễn Thu Hoa',
          parentName: parentNameFromStudent(stu),
        }),
      ),
    )

    setStudents(list)

    // auto-pick first
    if (!activeStudentId && list.length) setActiveStudentId(list[0].id)
    setLoading(false)
  }

  async function loadThread(studentId) {
    if (!studentId) return
    const t = await chatService.getThread(studentId)
    setThread(t)
  }

  useEffect(() => {
    loadList()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentClassId])

  useEffect(() => {
    loadThread(activeStudentId)
  }, [activeStudentId])

  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [thread?.messages?.length])

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    if (!term) return students
    return students.filter((s) => s.name.toLowerCase().includes(term) || s.id.toLowerCase().includes(term))
  }, [students, q])

  const activeStudent = useMemo(
    () => students.find((s) => s.id === activeStudentId) || null,
    [students, activeStudentId],
  )

  async function send() {
    const trimmed = text.trim()
    if (!trimmed || sending || !activeStudentId) return

    setSending(true)
    setText('')

    await chatService.sendMessage({ studentId: activeStudentId, from: 'TEACHER', text: trimmed })
    await loadThread(activeStudentId)

    setSending(false)
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title={`Tin nhắn · ${currentClass?.name || `Lớp ${currentClassId}`}`}
        subtitle="Chọn phụ huynh theo từng học sinh để nhắn đúng người (prototype)."
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[340px_1fr]">
        {/* Left: student/parent list */}
        <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-card">
          <div className="flex items-center justify-between gap-2">
            <div className="text-sm font-extrabold text-slate-900">Danh sách phụ huynh</div>
            <Badge tone="slate">{students.length} HS</Badge>
          </div>

          <div className="mt-3 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 focus-within:border-sky-400 focus-within:ring-4 focus-within:ring-sky-100">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm theo tên / mã HS..."
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>

          {loading ? (
            <div className="mt-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">Đang tải...</div>
          ) : (
            <div className="mt-3 space-y-2">
              {filtered.map((s) => {
                const active = s.id === activeStudentId
                return (
                  <button
                    key={s.id}
                    onClick={() => setActiveStudentId(s.id)}
                    className={
                      'w-full rounded-2xl border px-3 py-3 text-left transition ' +
                      (active ? 'border-sky-200 bg-sky-50' : 'border-slate-100 bg-white hover:bg-slate-50')
                    }
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="text-xl">{s.avatar}</div>
                        <div className="min-w-0">
                          <div className="truncate text-sm font-extrabold text-slate-900">{s.name}</div>
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-600">
                            <span>{s.id}</span>
                            <span className="h-1 w-1 rounded-full bg-slate-300" />
                            <span>{parentNameFromStudent(s)}</span>
                          </div>
                        </div>
                      </div>
                      {active ? <Badge tone="sky">Đang mở</Badge> : <Badge tone="slate">Chat</Badge>}
                    </div>
                  </button>
                )
              })}

              {!filtered.length ? (
                <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">Không tìm thấy.</div>
              ) : null}
            </div>
          )}
        </div>

        {/* Right: chat */}
        <div className="rounded-3xl border border-slate-100 bg-white shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-3">
            <div>
              <div className="text-sm font-extrabold text-slate-900">
                {activeStudent ? `${parentNameFromStudent(activeStudent)} · ${activeStudent.name}` : 'Chọn 1 học sinh'}
              </div>
              <div className="mt-1 text-xs text-slate-600">
                Thread theo học sinh: <span className="font-semibold">{activeStudentId || '—'}</span>
              </div>
            </div>
            {thread ? (
              <Badge tone="slate">{thread.messages?.length || 0} tin</Badge>
            ) : (
              <Badge tone="slate">—</Badge>
            )}
          </div>

          <div ref={scrollerRef} className="h-[55vh] min-h-[360px] space-y-2 overflow-auto bg-slate-50 p-3">
            {!thread ? (
              <div className="rounded-2xl bg-white p-4 text-sm text-slate-600">Hãy chọn 1 phụ huynh để xem cuộc trò chuyện.</div>
            ) : (
              thread.messages.map((m) => (
                <Bubble key={m.id} mine={m.from === 'TEACHER'} text={m.text} ts={m.ts} />
              ))
            )}
          </div>

          <div className="flex items-center gap-2 border-t border-slate-100 p-3">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={activeStudentId ? 'Nhắn phụ huynh...' : 'Chọn phụ huynh trước'}
              disabled={!activeStudentId}
              className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100 disabled:bg-slate-50"
              onKeyDown={(e) => {
                if (e.key === 'Enter') send()
              }}
            />
            <button
              onClick={send}
              disabled={!activeStudentId || sending}
              className="inline-flex items-center gap-2 rounded-2xl bg-sky-600 px-4 py-2 text-sm font-extrabold text-white disabled:opacity-50"
            >
              <SendHorizonal className="h-4 w-4" /> Gửi
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
