import React, { useEffect, useMemo, useRef, useState } from 'react'
import { SendHorizonal } from 'lucide-react'

import PageHeader from '../../components/common/PageHeader'
import Badge from '../../components/common/Badge'

import { useAuth } from '../../context/AuthContext'
import { teacherService } from '../../services/mock/teacherService'
import { chatService } from '../../services/mock/chatService'
import { useToast } from '../../components/common/ToastContext'

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

export default function ParentChat() {
  const { user } = useAuth()
  const studentId = user?.childId

  const [messages, setMessages] = useState([])
  const [threadMeta, setThreadMeta] = useState({ studentName: '', teacherName: '', parentName: user?.name || 'Phụ huynh' })
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)

  const scrollerRef = useRef(null)

  const headerRight = useMemo(() => {
    return (
      <div className="flex items-center gap-2">
        <Badge tone="sky">Con: {threadMeta.studentName || studentId}</Badge>
        <Badge tone="slate">GV: {threadMeta.teacherName || 'Giáo viên'}</Badge>
      </div>
    )
  }, [threadMeta.studentName, threadMeta.teacherName, studentId])

  async function load() {
    if (!studentId) return
    setLoading(true)

    // Resolve student name from teacherService (mock source of truth)
    const list = await teacherService.getClassList('5A')
    const stu = list.find((s) => s.id === studentId)
    const studentName = stu?.name || studentId

    await chatService.setParticipants({
      studentId,
      teacherName: 'Cô Nguyễn Thu Hoa',
      parentName: user?.name || 'Phụ huynh',
    })

    const thread = await chatService.getThread(studentId)

    setThreadMeta({
      studentName,
      teacherName: thread.teacherName,
      parentName: thread.parentName,
    })
    setMessages(thread.messages)
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId])

  useEffect(() => {
    // auto scroll
    const el = scrollerRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [messages.length, loading])

  async function send() {
    const trimmed = text.trim()
    if (!trimmed || sending || !studentId) return

    setSending(true)

    // optimistic message
    const optimistic = {
      id: `local_${Date.now()}`,
      from: 'PARENT',
      text: trimmed,
      ts: Date.now(),
    }
    setMessages((prev) => [...prev, optimistic])
    setText('')

    try {
      await chatService.sendMessage({ studentId, from: 'PARENT', text: trimmed })
    } catch (e) {
      showToast({
        title: 'Gửi thất bại',
        message: e?.message || 'Gửi tin nhắn thất bại',
        tone: 'rose',
      })
    } finally {
      setSending(false)
    }

    // Teacher auto reply (still demo) but now persists in the same thread
    window.setTimeout(async () => {
      await chatService.sendMessage({
        studentId,
        from: 'TEACHER',
        text: 'Cô đã nhận được tin nhắn. Cô sẽ phản hồi chi tiết sau giờ dạy nhé ạ.',
      })
      const thread = await chatService.getThread(studentId)
      setMessages(thread.messages)
    }, 1200)
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Tin nhắn"
        subtitle={`Phụ huynh: ${threadMeta.parentName} · Trao đổi với giáo viên về bé ${threadMeta.studentName || ''}.`}
        right={headerRight}
      />

      <div className="rounded-3xl border border-slate-100 bg-white shadow-card">
        <div
          ref={scrollerRef}
          className="h-[58vh] min-h-[380px] space-y-2 overflow-auto bg-slate-50 p-3"
        >
          {loading ? (
            <div className="rounded-2xl bg-white p-4 text-sm text-slate-600">
              Đang tải cuộc trò chuyện...
            </div>
          ) : (
            messages.map((m) => (
              <Bubble key={m.id} mine={m.from === 'PARENT'} text={m.text} ts={m.ts} />
            ))
          )}
        </div>

        <div className="flex items-center gap-2 border-t border-slate-100 p-3">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Nhắn cho cô..."
            className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
            onKeyDown={(e) => {
              if (e.key === 'Enter') send()
            }}
          />
          <button
            onClick={send}
            disabled={sending}
            className="inline-flex items-center gap-2 rounded-2xl bg-sky-600 px-4 py-2 text-sm font-extrabold text-white disabled:opacity-50"
          >
            <SendHorizonal className="h-4 w-4" />
            Gửi
          </button>
        </div>
      </div>
    </div>
  )
}
