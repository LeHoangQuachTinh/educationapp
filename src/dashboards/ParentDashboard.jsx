import React, { useMemo, useState } from 'react'
import { MessageCircle, SendHorizonal, TrendingUp } from 'lucide-react'

import { useApp } from '../context/AppProvider'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { formatDateTime, uid } from '../components/ui/helpers'

function Bar({ label, value, max, tone = 'bg-sky-600' }) {
  const pct = max === 0 ? 0 : Math.min(100, Math.round((value / max) * 100))
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs text-slate-600">
        <span>{label}</span>
        <span className="font-semibold">{value}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-slate-100">
        <div className={`h-2 rounded-full ${tone}`} style={{ width: pct + '%' }} />
      </div>
    </div>
  )
}

export function ParentDashboard() {
  const { state, actions, selectors } = useApp()
  const student = selectors.studentById[state.currentStudentId]

  const thread = state.chatThreads[student.id] || { participantParent: student.parent.name, messages: [] }
  const [message, setMessage] = useState('')

  const pointHistory = useMemo(() => {
    // lightweight chart from events
    const last = state.pointEvents
      .filter((e) => e.studentId === student.id)
      .slice(0, 6)
      .reverse()
      .map((e) => ({ label: new Date(e.ts).toLocaleDateString('vi-VN'), delta: e.delta }))
    if (!last.length) return [{ label: 'Hôm nay', delta: 0 }]
    return last
  }, [state.pointEvents, student.id])

  return (
    <div className="grid grid-cols-1 gap-4">
      <Card
        title="Parent Dashboard · Theo dõi & trao đổi"
        right={
          <div className="flex items-center gap-2">
            <Badge color="blue">Con: {student.fullName}</Badge>
            <Badge color="emerald">Ví: {student.points.balance} điểm</Badge>
          </div>
        }
      >
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <div className="text-sm font-semibold">Điểm danh</div>
            <div className="mt-2 space-y-2">
              <Bar label="Có mặt" value={student.attendance.presentDays} max={22} tone="bg-emerald-600" />
              <Bar label="Vắng" value={student.attendance.absentDays} max={10} tone="bg-rose-600" />
            </div>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-700" />
              <div className="text-sm font-semibold">Tăng trưởng điểm (mock)</div>
            </div>
            <div className="mt-3 space-y-2">
              {pointHistory.map((p, idx) => (
                <div key={idx} className="rounded-xl bg-white p-3">
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span>{p.label}</span>
                    <span className={p.delta >= 0 ? 'font-semibold text-emerald-700' : 'font-semibold text-rose-700'}>
                      {p.delta >= 0 ? '+' : ''}{p.delta}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <div className="text-sm font-semibold">Sức khỏe</div>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
              {student.healthNotes.map((n, idx) => (
                <li key={idx}>{n}</li>
              ))}
            </ul>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card
          title="Class Feed"
          right={
            <div className="flex items-center gap-2">
              <Badge color="slate">Thông báo</Badge>
              <Button
                variant="outline"
                onClick={() =>
                  actions.addAnnouncement({
                    title: 'Phụ huynh góp ý (mock)',
                    content: 'Em xin cảm ơn cô đã cập nhật tình hình lớp. Phụ huynh sẽ phối hợp thêm ạ.',
                  })
                }
              >
                + Đăng (mock)
              </Button>
            </div>
          }
        >
          <div className="space-y-3">
            {state.announcements.map((a) => (
              <div key={a.id} className="rounded-2xl border border-slate-100 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold">{a.title}</div>
                    <div className="mt-1 text-sm text-slate-700">{a.content}</div>
                    <div className="mt-2 text-xs text-slate-500">
                      {a.author} · {formatDateTime(a.createdAt)}
                    </div>
                  </div>
                  <Badge color="blue">Feed</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card
          title="One-on-One Chat"
          right={
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-sky-600" />
              <Badge color="blue">Cô Hoa</Badge>
            </div>
          }
        >
          <div className="flex h-[420px] flex-col">
            <div className="flex-1 space-y-2 overflow-auto rounded-2xl bg-slate-50 p-3">
              {thread.messages.map((m) => {
                const mine = m.from === 'parent'
                return (
                  <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={
                        'max-w-[80%] rounded-2xl px-3 py-2 text-sm ' +
                        (mine ? 'bg-sky-600 text-white' : 'bg-white text-slate-800')
                      }
                    >
                      <div>{m.text}</div>
                      <div className={`mt-1 text-[10px] ${mine ? 'text-white/80' : 'text-slate-500'}`}>
                        {new Date(m.ts).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-3 flex items-center gap-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Nhắn cho cô..."
              />
              <Button
                onClick={() => {
                  if (!message.trim()) return
                  actions.sendMessage({ studentId: student.id, from: 'parent', text: message.trim(), id: uid('msg') })
                  setMessage('')

                  // teacher auto-reply (simulation)
                  window.setTimeout(() => {
                    actions.sendMessage({
                      studentId: student.id,
                      from: 'teacher',
                      text: 'Dạ em đã nhận được ạ. Em sẽ phản hồi sớm nhé!',
                    })
                  }, 700)
                }}
              >
                <SendHorizonal className="h-4 w-4" /> Gửi
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
