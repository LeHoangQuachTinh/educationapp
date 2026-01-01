import React, { useEffect, useMemo, useState } from 'react'
import { CalendarDays, CheckCircle2, Clock3, MessageSquareText, XCircle } from 'lucide-react'

import PageHeader from '../../components/common/PageHeader'
import Badge from '../../components/common/Badge'
import { useToast } from '../../components/common/ToastContext'

import { teacherService } from '../../services/mock/teacherService'
import { attendanceService } from '../../services/mock/attendanceService'
import { leaveRequestService } from '../../services/mock/leaveRequestService'
import { notificationService } from '../../services/mock/notificationService'
import { useTeacherClass } from '../../context/TeacherClassContext'

function toneFor(status) {
  if (status === 'Present') return 'emerald'
  if (status === 'Absent') return 'rose'
  if (status === 'Late') return 'amber'
  return 'slate'
}

function IconFor({ status }) {
  if (status === 'Present') return <CheckCircle2 className="h-4 w-4" />
  if (status === 'Absent') return <XCircle className="h-4 w-4" />
  if (status === 'Late') return <Clock3 className="h-4 w-4" />
  return null
}

export default function Attendance() {
  const { currentClassId, currentClass } = useTeacherClass()
  const { showToast } = useToast()

  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)

  const [dateKey, setDateKey] = useState(attendanceService.getTodayKey())
  const [record, setRecord] = useState({ statuses: {}, updatedAt: null })
  const [requests, setRequests] = useState([])
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    const [data, rec, reqs] = await Promise.all([
      teacherService.getClassList(currentClassId),
      attendanceService.getRecord({ classId: currentClassId, dateKey }),
      leaveRequestService.listByDate({ dateKey }),
    ])

    // merge: local record overrides service seed status
    const merged = data.map((s) => ({
      ...s,
      status: rec.statuses?.[s.id] || s.status,
    }))

    setStudents(merged)
    setRecord(rec)
    setRequests(reqs)
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentClassId, dateKey])

  const summary = useMemo(() => {
    const present = students.filter((s) => s.status === 'Present').length
    const absent = students.filter((s) => s.status === 'Absent').length
    const late = students.filter((s) => s.status === 'Late').length
    return { present, absent, late }
  }, [students])

  async function setStatus(studentId, status) {
    setSaving(true)
    try {
      const rec = await attendanceService.upsertStatus({
        classId: currentClassId,
        dateKey,
        studentId,
        status,
      })

      setRecord(rec)
      setStudents((prev) => prev.map((s) => (s.id === studentId ? { ...s, status } : s)))
      showToast({ title: 'Điểm danh', message: `Đã cập nhật: ${status}`, tone: toneFor(status) })
    } finally {
      setSaving(false)
    }
  }

  async function bulk(status) {
    setSaving(true)
    try {
      const rec = await attendanceService.setAll({
        classId: currentClassId,
        dateKey,
        studentIds: students.map((s) => s.id),
        status,
      })
      setRecord(rec)
      setStudents((prev) => prev.map((s) => ({ ...s, status })))
      showToast({ title: 'Điểm danh', message: `Đã cập nhật cả lớp: ${status}`, tone: toneFor(status) })
    } finally {
      setSaving(false)
    }
  }

  async function handleRequest(req, decision) {
    // decision: 'APPROVED' | 'REJECTED'
    setSaving(true)
    try {
      const next = await leaveRequestService.updateStatus({
        id: req.id,
        studentId: req.studentId,
        dateKey: req.dateKey,
        status: decision,
        teacherNote: req.teacherNote,
      })

      if (decision === 'APPROVED' && req.type === 'ABSENCE') {
        // Auto mark absent
        const rec = await attendanceService.upsertStatus({
          classId: currentClassId,
          dateKey,
          studentId: req.studentId,
          status: 'Absent',
        })
        setRecord(rec)
        setStudents((prev) => prev.map((s) => (s.id === req.studentId ? { ...s, status: 'Absent' } : s)))
      }

      // Push a teacher notification to parent feed (global in this prototype)
      const actionLabel = decision === 'APPROVED' ? 'đã duyệt' : 'đã từ chối'
      const typeLabel = req.type === 'ABSENCE' ? 'xin nghỉ' : 'thay đổi đón'
      await notificationService.add({
        studentId: req.studentId,
        source: 'TEACHER',
        text: `Giáo viên ${actionLabel} yêu cầu ${typeLabel} ngày ${req.dateKey} (HS: ${req.studentId}).`,
      })

      showToast({
        title: 'Yêu cầu phụ huynh',
        message: `${actionLabel.toUpperCase()} · ${typeLabel} · ${req.studentId}`,
        tone: decision === 'APPROVED' ? 'emerald' : 'rose',
      })

      setRequests((prev) => prev.map((r) => (r.id === req.id ? next : r)))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title={`Điểm danh · ${currentClass?.name || `Lớp ${currentClassId}`}`}
        subtitle="Chọn ngày, cập nhật trạng thái từng học sinh. Dữ liệu được lưu local (prototype)."
        right={
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="slate">
              <CalendarDays className="mr-1 inline h-4 w-4" /> {dateKey}
            </Badge>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">Có mặt: {summary.present}</span>
            <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-800">Vắng: {summary.absent}</span>
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">Trễ: {summary.late}</span>
          </div>
        }
      />

      <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs font-semibold text-slate-600">Ngày điểm danh</div>
            <input
              type="date"
              value={dateKey}
              onChange={(e) => setDateKey(e.target.value)}
              className="mt-1 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
            />
            <div className="mt-2 text-xs text-slate-500">{record.updatedAt ? `Cập nhật lần cuối: ${new Date(record.updatedAt).toLocaleString('vi-VN')}` : 'Chưa có cập nhật trong ngày.'}</div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              disabled={saving || loading}
              onClick={() => bulk('Present')}
              className="rounded-2xl bg-emerald-600 px-3 py-2 text-xs font-extrabold text-white disabled:opacity-50"
            >
              Có mặt hết
            </button>
            <button
              disabled={saving || loading}
              onClick={() => bulk('Absent')}
              className="rounded-2xl bg-rose-600 px-3 py-2 text-xs font-extrabold text-white disabled:opacity-50"
            >
              Vắng hết
            </button>
            <button
              disabled={saving || loading}
              onClick={() => bulk('Late')}
              className="rounded-2xl bg-amber-600 px-3 py-2 text-xs font-extrabold text-white disabled:opacity-50"
            >
              Trễ hết
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-card">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <MessageSquareText className="h-4 w-4 text-slate-600" />
            <div>
              <div className="text-sm font-extrabold text-slate-900">Yêu cầu phụ huynh</div>
              <div className="mt-1 text-xs text-slate-600">Theo ngày đang chọn. Duyệt sẽ tự cập nhật điểm danh (xin nghỉ).</div>
            </div>
          </div>
          <Badge tone="slate">{requests.filter((r) => r.status === 'PENDING').length} pending</Badge>
        </div>

        <div className="mt-3 space-y-2">
          {requests.filter((r) => r.status === 'PENDING').map((r) => (
            <div key={r.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-sm font-extrabold text-slate-900">
                  {r.type === 'ABSENCE' ? 'Xin nghỉ' : 'Thay đổi đón'} · HS: {r.studentId}
                </div>
                <Badge tone="amber">PENDING</Badge>
              </div>
              <div className="mt-2 text-sm text-slate-700">
                {r.type === 'ABSENCE' ? r.reason : `Người đón: ${r.pickupBy} (${r.pickupPhone})`}
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <input
                  value={r.teacherNote || ''}
                  onChange={(e) =>
                    setRequests((prev) => prev.map((x) => (x.id === r.id ? { ...x, teacherNote: e.target.value } : x)))
                  }
                  placeholder="Ghi chú cho phụ huynh (tuỳ chọn)"
                  className="min-w-[240px] flex-1 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                />

                <div className="flex items-center gap-2">
                  <button
                    disabled={saving}
                    onClick={() => handleRequest(r, 'REJECTED')}
                    className="rounded-2xl bg-rose-600 px-3 py-2 text-xs font-extrabold text-white disabled:opacity-50"
                  >
                    Từ chối
                  </button>
                  <button
                    disabled={saving}
                    onClick={() => handleRequest(r, 'APPROVED')}
                    className="rounded-2xl bg-emerald-600 px-3 py-2 text-xs font-extrabold text-white disabled:opacity-50"
                  >
                    Duyệt
                  </button>
                </div>
              </div>
            </div>
          ))}

          {!requests.filter((r) => r.status === 'PENDING').length ? (
            <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">Không có yêu cầu chờ duyệt.</div>
          ) : null}
        </div>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-card">Đang tải...</div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {students.map((s) => (
            <div key={s.id} className="rounded-3xl border border-slate-100 bg-white p-4 shadow-card">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{s.avatar}</div>
                  <div>
                    <div className="text-sm font-extrabold">{s.name}</div>
                    <div className="text-xs text-slate-600">{s.id}</div>
                    <div className="mt-2 inline-flex items-center gap-2">
                      <Badge tone={toneFor(s.status)}>
                        <span className="inline-flex items-center gap-1">
                          <IconFor status={s.status} /> {s.status}
                        </span>
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    disabled={saving}
                    onClick={() => setStatus(s.id, 'Present')}
                    className="rounded-xl bg-emerald-100 px-3 py-2 text-xs font-extrabold text-emerald-800 hover:bg-emerald-200 disabled:opacity-50"
                  >
                    Có mặt
                  </button>
                  <button
                    disabled={saving}
                    onClick={() => setStatus(s.id, 'Late')}
                    className="rounded-xl bg-amber-100 px-3 py-2 text-xs font-extrabold text-amber-800 hover:bg-amber-200 disabled:opacity-50"
                  >
                    Trễ
                  </button>
                  <button
                    disabled={saving}
                    onClick={() => setStatus(s.id, 'Absent')}
                    className="rounded-xl bg-rose-100 px-3 py-2 text-xs font-extrabold text-rose-800 hover:bg-rose-200 disabled:opacity-50"
                  >
                    Vắng
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
