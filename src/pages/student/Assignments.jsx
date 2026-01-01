import React, { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, Clock, SendHorizonal, Sparkles, TriangleAlert } from 'lucide-react'

import PageHeader from '../../components/common/PageHeader'
import Badge from '../../components/common/Badge'
import EmptyState from '../../components/common/EmptyState'
import { useToast } from '../../components/common/ToastContext'

import { useAuth } from '../../context/AuthContext'
import { assignmentService } from '../../services/mock/assignmentService'

function formatDue(ts) {
  return new Date(ts).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })
}

function TaskCard({ assignment, onOpen }) {
  const done = !!assignment.submission
  const overdue = useMemo(() => {
    if (!assignment?.dueAt) return false
    if (!done) return Date.now() > assignment.dueAt
    return assignment.submission?.submittedAt > assignment.dueAt
  }, [assignment?.dueAt, assignment?.submission?.submittedAt, done])

  return (
    <button
      onClick={onOpen}
      className={
        'w-full rounded-3xl border p-4 text-left shadow-card transition hover:-translate-y-[1px] hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-sky-100 ' +
        (done ? 'border-emerald-100 bg-emerald-50' : overdue ? 'border-rose-100 bg-rose-50' : 'border-slate-100 bg-white hover:bg-slate-50')
      }
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="sky">{assignment.subject}</Badge>
            <Badge tone={done ? 'emerald' : overdue ? 'rose' : 'amber'}>
              {done ? 'Đã nộp' : overdue ? 'Trễ hạn' : 'Chưa nộp'}
            </Badge>
          </div>
          <div className="mt-2 text-sm font-extrabold text-slate-900">{assignment.title}</div>
          <div className="mt-2 flex flex-col gap-1 text-xs font-semibold text-slate-600">
            <div className="inline-flex items-center gap-2">
              <Clock className="h-4 w-4" /> Hạn nộp: {formatDue(assignment.dueAt)}
            </div>
            {done ? (
              <div className="inline-flex items-center gap-2 text-slate-500">
                <CheckCircle2 className="h-4 w-4" /> Đã nộp: {formatDue(assignment.submission.submittedAt)}
              </div>
            ) : null}
            {!done && overdue ? (
              <div className="inline-flex items-center gap-2 text-rose-700">
                <TriangleAlert className="h-4 w-4" /> Đã quá hạn
              </div>
            ) : null}
          </div>
        </div>
        <div className="text-right">
          <div className="rounded-2xl bg-gradient-to-r from-sky-600 to-orange-500 px-3 py-2 text-xs font-extrabold text-white">
            +{assignment.pointsReward}
          </div>
          {done ? (
            <div className="mt-2 inline-flex items-center gap-1 text-xs font-extrabold text-emerald-700">
              <CheckCircle2 className="h-4 w-4" /> Done
            </div>
          ) : null}
        </div>
      </div>
    </button>
  )
}

export default function Assignments() {
  const { user, updateUser } = useAuth()
  const { showToast } = useToast()

  const [loading, setLoading] = useState(true)
  const [list, setList] = useState([])
  const [active, setActive] = useState(null)
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function load() {
    setLoading(true)
    const data = await assignmentService.listAssignments({ classId: '5A', studentId: user.id })
    setList(data)
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function submit() {
    if (!active || !content.trim() || submitting) return
    setSubmitting(true)

    const wasSubmitted = !!active.submission

    try {
      const sub = await assignmentService.submitAssignment({
        assignmentId: active.id,
        studentId: user.id,
        content: content.trim(),
      })

      // Reward points only on first submission (realistic).
      if (!wasSubmitted) {
        updateUser({ points: (user.points || 0) + (sub.earnedPoints || 0) })
        showToast({ title: 'Nộp bài thành công', message: `+${sub.earnedPoints || 0} điểm`, tone: 'emerald' })
      } else {
        showToast({ title: 'Đã cập nhật bài nộp', message: 'Bài đã được ghi nhận lại (không cộng điểm thêm).', tone: 'sky' })
      }

      await load()
      setActive(null)
      setContent('')
    } catch (e) {
      showToast({ title: 'Lỗi nộp bài', message: e?.message || 'Không nộp được bài', tone: 'rose' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="pb-24 p-4 md:p-6 md:pb-6 space-y-4">
      <PageHeader
        title="Bài tập"
        subtitle="Làm bài – nộp bài – nhận điểm!"
        right={
          <div className="flex items-center gap-2">
            <Badge tone="candy">🔥 Chuỗi: 3 ngày</Badge>
            <Badge tone="emerald">💰 {user.points ?? 0} điểm</Badge>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* List */}
        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-extrabold text-slate-900">Danh sách bài tập</div>
              <div className="mt-1 text-sm text-slate-600">Chọn 1 bài để bắt đầu.</div>
            </div>
            <Badge tone="sky">{list.length} bài</Badge>
          </div>

          {loading ? (
            <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">Đang tải...</div>
          ) : list.length ? (
            <div className="mt-4 space-y-3">
              {list.map((a) => (
                <TaskCard
                  key={a.id}
                  assignment={a}
                  onOpen={() => {
                    setActive(a)
                    setContent(a.submission?.content || '')
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="mt-4">
              <EmptyState title="Chưa có bài tập" description="Cô giáo chưa giao bài mới cho lớp hôm nay." />
            </div>
          )}
        </div>

        {/* Do homework */}
        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-extrabold text-slate-900">Khu làm bài</div>
              <div className="mt-1 text-sm text-slate-600">Nhập lời giải / link ảnh chụp để nộp.</div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
              <Sparkles className="h-5 w-5" />
            </div>
          </div>

          {!active ? (
            <div className="mt-4 rounded-3xl bg-slate-50 p-6 text-center">
              <div className="text-4xl">🧩</div>
              <div className="mt-2 text-sm font-extrabold text-slate-900">Chọn 1 bài bên trái</div>
              <div className="mt-1 text-sm text-slate-600">Rồi nhập đáp án để nộp.</div>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              <div className="rounded-3xl bg-slate-50 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="sky">{active.subject}</Badge>
                  <Badge tone="amber">+{active.pointsReward} điểm</Badge>
                </div>
                <div className="mt-2 text-sm font-extrabold text-slate-900">{active.title}</div>
                <div className="mt-2 text-sm text-slate-700">{active.description}</div>
              </div>

              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
                className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                placeholder="Ví dụ: Em đã làm bài 1-5, ảnh chụp: https://..."
              />

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={submit}
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-3xl bg-gradient-to-r from-sky-600 to-orange-500 px-5 py-3 text-sm font-extrabold text-white shadow-card disabled:opacity-50"
                >
                  <SendHorizonal className="h-4 w-4" /> {submitting ? 'Đang nộp...' : 'Nộp bài'}
                </button>
                <button
                  onClick={() => {
                    setActive(null)
                    setContent('')
                  }}
                  className="rounded-3xl bg-slate-100 px-5 py-3 text-sm font-extrabold text-slate-700"
                >
                  Đóng
                </button>
              </div>

              <div className="text-xs text-slate-500">Nộp bài xong sẽ nhận điểm ngay để đổi quà nhé!</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
