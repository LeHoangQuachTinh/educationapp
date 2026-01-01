import React from 'react'
import { X } from 'lucide-react'

export default function StudentInfoModal({ open, student, onClose }) {
  if (!open || !student) return null

  const statusLabel =
    student.status === 'Present' ? 'Có mặt' : student.status === 'Absent' ? 'Vắng' : 'Trễ'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button className="absolute inset-0 bg-slate-900/40" onClick={onClose} aria-label="Đóng" />

      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-card">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-slate-50 text-3xl">
              {student.avatar}
            </div>
            <div>
              <div className="text-sm font-extrabold text-slate-900">{student.name}</div>
              <div className="text-xs text-slate-600">
                ID: {student.id} · {student.className || `Lớp ${student.classId || '?'}`}
              </div>
            </div>
          </div>

          <button onClick={onClose} className="rounded-2xl p-2 text-slate-600 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-xs font-semibold text-slate-600">Điểm hiện tại</div>
              <div className="mt-1 text-2xl font-extrabold text-sky-700">{student.currentPoints}</div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-xs font-semibold text-slate-600">Trạng thái</div>
              <div className="mt-1 text-sm font-extrabold text-slate-900">{statusLabel}</div>
              <div className="mt-1 text-xs text-slate-600">Bàn {student.position.y + 1}-{student.position.x + 1}</div>
            </div>
          </div>

          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-4">
            <div className="text-xs font-semibold text-slate-600">Thông tin phụ huynh (mock)</div>
            <div className="mt-1 text-sm text-slate-800">SĐT: 09xx xxx xxx · Zalo: zalo.me/phuhuynh</div>
          </div>

          <div className="rounded-2xl bg-emerald-50 p-4">
            <div className="text-xs font-semibold text-emerald-800">Gợi ý</div>
            <div className="mt-1 text-sm text-emerald-900">Mở Quick Action để cộng điểm/điểm danh.</div>
          </div>
        </div>

        <div className="border-t border-slate-100 px-5 py-4">
          <button onClick={onClose} className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-extrabold text-white">
            Đóng
          </button>
        </div>
      </div>
    </div>
  )
}
