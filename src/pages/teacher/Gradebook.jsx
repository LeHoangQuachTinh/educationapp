import React, { useEffect, useMemo, useState } from 'react'
import { Pencil, Save } from 'lucide-react'

import PageHeader from '../../components/common/PageHeader'
import Badge from '../../components/common/Badge'
import Modal from '../../components/common/Modal'
import SoftButton from '../../components/common/SoftButton'
import SectionCard from '../../components/common/SectionCard'

import { useTeacherClass } from '../../context/TeacherClassContext'
import { teacherService } from '../../services/mock/teacherService'
import { gradeService } from '../../services/mock/gradeService'
import { useToast } from '../../components/common/ToastContext'

function fmt(v) {
  if (v === null || v === undefined) return '—'
  return String(v)
}

export default function Gradebook() {
  const { currentClassId, currentClass } = useTeacherClass()
  const { showToast } = useToast()

  const [loading, setLoading] = useState(true)
  const [students, setStudents] = useState([])
  const [gradebook, setGradebook] = useState(null)

  const [editorOpen, setEditorOpen] = useState(false)
  const [editCtx, setEditCtx] = useState(null) // {student, subject, componentKey}
  const [score, setScore] = useState('')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    const [classStudents, gb] = await Promise.all([
      teacherService.getClassList(currentClassId),
      gradeService.getGradebookByClass(currentClassId, 'HK1'),
    ])
    setStudents(classStudents)
    setGradebook(gb)
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentClassId])

  const studentById = useMemo(() => {
    const m = new Map()
    for (const s of students) m.set(s.id, s)
    return m
  }, [students])

  function openEditor(studentId, subjectId) {
    const student = studentById.get(studentId)
    const subject = gradebook.subjects.find((s) => s.id === subjectId)
    const componentKey = 'final' // default focus

    setEditCtx({ student, subject, componentKey })
    setScore('')
    setNote('')
    setEditorOpen(true)
  }

  async function save() {
    if (!editCtx) return
    setSaving(true)
    try {
      await gradeService.upsertGrade({
        classId: currentClassId,
        studentId: editCtx.student.id,
        subjectId: editCtx.subject.id,
        componentKey: editCtx.componentKey,
        score,
        note,
      })
      showToast({ title: 'Đã lưu điểm', message: 'Cập nhật thành công.', tone: 'emerald' })
      setEditorOpen(false)
      await load()
    } catch (e) {
      showToast({ title: 'Lỗi', message: e?.message || 'Không lưu được', tone: 'rose' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title={`Sổ điểm · ${currentClass?.name || `Lớp ${currentClassId}`}`}
        subtitle="Nhập/sửa điểm thành phần theo môn (THCS)."
        right={<Badge tone="sky">HK1</Badge>}
      />

      <SectionCard
        title="Bảng điểm tổng hợp"
        subtitle="Click vào ô điểm để chỉnh sửa nhanh."
        right={<Badge tone="slate">{students.length} HS</Badge>}
      >
        {loading || !gradebook ? (
          <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">Đang tải...</div>
        ) : (
          <div className="overflow-auto">
            <div className="min-w-[980px]">
              <div className="grid grid-cols-[240px_repeat(5,140px)_120px] gap-2">
                <div className="rounded-2xl bg-slate-900 px-3 py-2 text-xs font-extrabold text-white">Học sinh</div>
                {gradebook.subjects.map((s) => (
                  <div key={s.id} className="rounded-2xl bg-slate-900 px-3 py-2 text-xs font-extrabold text-white">
                    {s.name}
                  </div>
                ))}
                <div className="rounded-2xl bg-slate-900 px-3 py-2 text-xs font-extrabold text-white">TB</div>

                {gradebook.rows.map((r) => {
                  const stu = studentById.get(r.studentId)
                  return (
                    <React.Fragment key={r.studentId}>
                      <div className="rounded-2xl border border-slate-100 bg-white px-3 py-3">
                        <div className="flex items-center gap-2">
                          <div className="text-xl">{stu?.avatar || '🙂'}</div>
                          <div>
                            <div className="text-sm font-extrabold text-slate-900">{stu?.name || r.studentId}</div>
                            <div className="text-xs text-slate-500">{r.studentId}</div>
                          </div>
                        </div>
                      </div>
                      {gradebook.subjects.map((sub) => (
                        <button
                          key={sub.id}
                          onClick={() => openEditor(r.studentId, sub.id)}
                          className="rounded-2xl border border-slate-100 bg-slate-50 px-3 py-3 text-left hover:bg-slate-100"
                          title="Sửa điểm"
                        >
                          <div className="flex items-center justify-between">
                            <div className="text-xs font-semibold text-slate-600">TB</div>
                            <Pencil className="h-4 w-4 text-slate-400" />
                          </div>
                          <div className="mt-1 text-sm font-extrabold text-slate-900">{fmt(r.perSubject[sub.id])}</div>
                        </button>
                      ))}
                      <div className="rounded-2xl border border-slate-100 bg-white px-3 py-3">
                        <div className="text-xs font-semibold text-slate-600">TB chung</div>
                        <div className="mt-1 text-sm font-extrabold text-slate-900">{fmt(r.overallAverage)}</div>
                      </div>
                    </React.Fragment>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </SectionCard>

      <Modal
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        title={editCtx ? `Nhập điểm · ${editCtx.student.name} · ${editCtx.subject.name}` : 'Nhập điểm'}
        footer={
          <div className="flex items-center justify-end gap-2">
            <SoftButton onClick={() => setEditorOpen(false)}>Huỷ</SoftButton>
            <SoftButton tone="emerald" onClick={save} disabled={saving}>
              <Save className="h-4 w-4" /> {saving ? 'Đang lưu...' : 'Lưu'}
            </SoftButton>
          </div>
        }
      >
        {editCtx ? (
          <div className="space-y-3">
            <div>
              <div className="text-xs font-semibold text-slate-600">Loại điểm</div>
              <select
                value={editCtx.componentKey}
                onChange={(e) => setEditCtx((p) => ({ ...p, componentKey: e.target.value }))}
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm"
              >
                {gradebook?.components?.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.label} (x{c.weight})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-600">Điểm (0–10)</div>
              <input
                value={score}
                onChange={(e) => setScore(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm"
                placeholder="VD: 8.5"
              />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-600">Nhận xét (tuỳ chọn)</div>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm"
                placeholder="VD: Cần luyện thêm phần bài tập vận dụng"
              />
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  )
}
