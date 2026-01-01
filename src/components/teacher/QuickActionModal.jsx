import React, { useMemo, useState } from 'react'
import { X } from 'lucide-react'

import { teacherService } from '../../services/mock/teacherService'
import { useToast } from '../common/ToastContext'

function TabButton({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={
        'rounded-2xl px-3 py-2 text-sm font-extrabold transition ' +
        (active ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200')
      }
    >
      {children}
    </button>
  )
}

function ActionButton({ variant = 'primary', children, onClick }) {
  const map = {
    primary: 'bg-sky-600 hover:bg-sky-700 text-white',
    success: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    warn: 'bg-amber-500 hover:bg-amber-600 text-white',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white',
    outline: 'border border-slate-200 bg-white text-slate-800 hover:bg-slate-50',
  }

  return (
    <button
      onClick={onClick}
      className={`rounded-2xl px-3 py-2 text-sm font-extrabold transition ${map[variant]}`}
    >
      {children}
    </button>
  )
}

export default function QuickActionModal({ open, student, onClose, onOptimisticUpdate }) {
  const [tab, setTab] = useState('points')
  const [saving, setSaving] = useState(false)
  const { showToast } = useToast()

  const title = useMemo(() => {
    if (!student) return ''
    return `${student.name} · ${student.currentPoints} điểm`
  }, [student])

  if (!open || !student) return null

  async function applyPoints(amount, reason) {
    if (saving) return
    setSaving(true)

    // optimistic update
    onOptimisticUpdate?.({
      studentId: student.id,
      patch: { currentPoints: Math.max(0, (student.currentPoints || 0) + amount) },
    })

    try {
      await teacherService.updateStudentPoints(student.id, amount, reason)
    } catch (e) {
      // naive rollback: reload is out of scope; show alert
      showToast({
        title: 'Cập nhật thất bại',
        message: e?.message || 'Cập nhật điểm thất bại',
        tone: 'rose',
      })
    } finally {
      setSaving(false)
      onClose?.()
    }
  }

  async function applyAttendance(status) {
    if (saving) return
    setSaving(true)

    onOptimisticUpdate?.({ studentId: student.id, patch: { status } })

    try {
      await teacherService.updateAttendance(student.id, status)
    } catch (e) {
      showToast({
        title: 'Cập nhật thất bại',
        message: e?.message || 'Cập nhật điểm danh thất bại',
        tone: 'rose',
      })
    } finally {
      setSaving(false)
      onClose?.()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button className="absolute inset-0 bg-slate-900/40" onClick={onClose} aria-label="Đóng" />

      <div className="relative w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-card">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-slate-50 text-3xl">
              {student.avatar}
            </div>
            <div>
              <div className="text-sm font-extrabold text-slate-900">{student.name}</div>
              <div className="text-xs text-slate-600">Điểm hiện tại: {student.currentPoints}</div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-2xl p-2 text-slate-600 hover:bg-slate-100"
            aria-label="Đóng"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5">
          <div className="flex flex-wrap gap-2">
            <TabButton active={tab === 'points'} onClick={() => setTab('points')}>
              Gamification
            </TabButton>
            <TabButton active={tab === 'attendance'} onClick={() => setTab('attendance')}>
              Attendance
            </TabButton>
          </div>

          <div className="mt-4">
            {tab === 'points' ? (
              <div className="space-y-3">
                <div className="text-sm font-semibold text-slate-700">Cho / trừ điểm nhanh</div>
                <div className="flex flex-wrap gap-2">
                  <ActionButton onClick={() => applyPoints(1, 'Chăm chỉ (+1)')}>
                    +1 Chăm chỉ
                  </ActionButton>
                  <ActionButton onClick={() => applyPoints(2, 'Phát biểu hay (+2)')} variant="success">
                    +2 Phát biểu hay
                  </ActionButton>
                  <ActionButton onClick={() => applyPoints(5, 'Điểm 10 (+5)')} variant="warn">
                    +5 Điểm 10
                  </ActionButton>
                  <ActionButton onClick={() => applyPoints(-1, 'Mất trật tự (-1)')} variant="danger">
                    -1 Mất trật tự
                  </ActionButton>
                </div>
                <div className="text-xs text-slate-500">{saving ? 'Đang lưu...' : 'Cập nhật sẽ được mô phỏng qua mock API (500ms).'}</div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-sm font-semibold text-slate-700">Điểm danh</div>
                <div className="flex flex-wrap gap-2">
                  <ActionButton variant="success" onClick={() => applyAttendance('Present')}>
                    Có mặt
                  </ActionButton>
                  <ActionButton variant="danger" onClick={() => applyAttendance('Absent')}>
                    Vắng
                  </ActionButton>
                  <ActionButton variant="warn" onClick={() => applyAttendance('Late')}>
                    Trễ
                  </ActionButton>
                </div>
                <div className="text-xs text-slate-500">{saving ? 'Đang lưu...' : 'Trạng thái sẽ cập nhật ngay (optimistic) rồi sync qua mock API.'}</div>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-slate-100 px-5 py-4">
          <div className="text-xs text-slate-600">{title}</div>
        </div>
      </div>
    </div>
  )
}
