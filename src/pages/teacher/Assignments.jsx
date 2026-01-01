import React, { useEffect, useState } from 'react'
import { Plus, Send, Users } from 'lucide-react'

import PageHeader from '../../components/common/PageHeader'
import { useAuth } from '../../context/AuthContext'
import { assignmentService } from '../../services/mock/assignmentService'
import { useTeacherClass } from '../../context/TeacherClassContext'

function formatDue(ts) {
  return new Date(ts).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })
}

export default function TeacherAssignments() {
  const { currentClassId, currentClass } = useTeacherClass()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [list, setList] = useState([])

  const [creating, setCreating] = useState(false)
  const [subject, setSubject] = useState('Toán')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [pointsReward, setPointsReward] = useState(5)

  const [active, setActive] = useState(null)
  const [subs, setSubs] = useState([])
  const [loadingSubs, setLoadingSubs] = useState(false)

  async function load() {
    setLoading(true)
    const data = await assignmentService.listAssignments({ classId: currentClassId })
    setList(data)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function create() {
    if (!title.trim()) return
    setCreating(true)
    try {
      await assignmentService.createAssignment({
        classId: currentClassId,
        subject,
        title: title.trim(),
        description: description.trim(),
        dueAt: Date.now() + 1000 * 60 * 60 * 24, // tomorrow
        pointsReward: Number(pointsReward) || 0,
        createdBy: user.username,
      })
      setTitle('')
      setDescription('')
      await load()
    } finally {
      setCreating(false)
    }
  }

  async function openSubmissions(a) {
    setActive(a)
    setLoadingSubs(true)
    const data = await assignmentService.listSubmissions(a.id)
    setSubs(data)
    setLoadingSubs(false)
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Giao bài tập"
        subtitle="Tạo bài tập cho lớp và xem bài nộp (mock)."
        right={
          <div className="rounded-2xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white">
            {currentClass?.name || `Lớp ${currentClassId}`}
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-card lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-extrabold">Danh sách bài tập</div>
              <div className="mt-1 text-sm text-slate-600">Click để xem danh sách bài nộp.</div>
            </div>
          </div>

          {loading ? (
            <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">Đang tải...</div>
          ) : (
            <div className="mt-4 space-y-2">
              {list.map((a) => (
                <button
                  key={a.id}
                  onClick={() => openSubmissions(a)}
                  className="w-full rounded-2xl border border-slate-100 bg-white p-4 text-left hover:bg-slate-50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-xs font-semibold text-slate-600">{a.subject}</div>
                      <div className="mt-1 text-sm font-extrabold text-slate-900">{a.title}</div>
                      <div className="mt-2 text-xs text-slate-600">Hạn nộp: {formatDue(a.dueAt)}</div>
                    </div>
                    <div className="text-right">
                      <div className="rounded-2xl bg-sky-600 px-3 py-2 text-xs font-extrabold text-white">+{a.pointsReward}</div>
                      <div className="mt-2 text-xs text-slate-500">ID: {a.id}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {active ? (
            <div className="mt-4 rounded-3xl border border-slate-100 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-extrabold">Bài nộp · {active.title}</div>
                  <div className="mt-1 text-xs text-slate-600">{active.subject} · +{active.pointsReward} điểm</div>
                </div>
                <button
                  onClick={() => {
                    setActive(null)
                    setSubs([])
                  }}
                  className="rounded-2xl bg-white px-3 py-2 text-xs font-semibold text-slate-700"
                >
                  Đóng
                </button>
              </div>

              {loadingSubs ? (
                <div className="mt-3 rounded-2xl bg-white p-3 text-sm text-slate-600">Đang tải submissions...</div>
              ) : subs.length ? (
                <div className="mt-3 space-y-2">
                  {subs.map((s) => (
                    <div key={s.id} className="rounded-2xl bg-white p-3">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-extrabold">Học sinh: {s.studentId}</div>
                        <div className="text-xs text-slate-500">{formatDue(s.submittedAt)}</div>
                      </div>
                      <div className="mt-2 text-sm text-slate-700">{s.content}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-3 rounded-2xl bg-white p-3 text-sm text-slate-600">Chưa có ai nộp bài.</div>
              )}
            </div>
          ) : null}
        </div>

        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-card">
          <div className="flex items-center gap-2">
            <Plus className="h-4 w-4 text-sky-600" />
            <div className="text-sm font-extrabold">Tạo bài tập</div>
          </div>

          <div className="mt-4 space-y-3">
            <div>
              <div className="text-xs font-semibold text-slate-600">Môn</div>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm"
              >
                <option>Toán</option>
                <option>Tiếng Việt</option>
                <option>Khoa học</option>
                <option>Tiếng Anh</option>
              </select>
            </div>

            <div>
              <div className="text-xs font-semibold text-slate-600">Tiêu đề</div>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm"
                placeholder="VD: Bài tập phân số"
              />
            </div>

            <div>
              <div className="text-xs font-semibold text-slate-600">Mô tả</div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm"
                placeholder="Nội dung yêu cầu..."
              />
            </div>

            <div>
              <div className="text-xs font-semibold text-slate-600">Thưởng điểm</div>
              <input
                type="number"
                value={pointsReward}
                onChange={(e) => setPointsReward(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm"
              />
            </div>

            <button
              onClick={create}
              disabled={creating}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-sky-600 px-4 py-3 text-sm font-extrabold text-white disabled:opacity-50"
            >
              <Send className="h-4 w-4" /> {creating ? 'Đang tạo...' : 'Giao bài'}
            </button>

            <div className="rounded-2xl bg-slate-50 p-3 text-xs text-slate-600">
              <Users className="inline h-4 w-4" /> Bài tập sẽ hiển thị ngay cho học sinh (mock shared service).
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
