import React, { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, ClipboardSignature } from 'lucide-react'

import PageHeader from '../../components/common/PageHeader'
import { useTeacherClass } from '../../context/TeacherClassContext'
import { syllabusService } from '../../services/mock/syllabusService'
import { logbookService } from '../../services/mock/logbookService'
import { teacherService } from '../../services/mock/teacherService'

function Badge({ tone = 'slate', children }) {
  const map = {
    slate: 'bg-slate-100 text-slate-700',
    emerald: 'bg-emerald-100 text-emerald-800',
    amber: 'bg-amber-100 text-amber-800',
    rose: 'bg-rose-100 text-rose-800',
    sky: 'bg-sky-100 text-sky-800',
  }
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${map[tone] || map.slate}`}>
      {children}
    </span>
  )
}

function Modal({ open, onClose, title, children, footer }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button className="absolute inset-0 bg-slate-900/40" onClick={onClose} aria-label="Đóng" />
      <div className="relative w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-card">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div className="text-sm font-extrabold">{title}</div>
          <button onClick={onClose} className="rounded-2xl px-3 py-2 text-xs font-semibold hover:bg-slate-100">
            Đóng
          </button>
        </div>
        <div className="max-h-[75vh] overflow-auto p-5">{children}</div>
        {footer ? <div className="border-t border-slate-100 px-5 py-4">{footer}</div> : null}
      </div>
    </div>
  )
}

function StarRating({ value, onChange, max = 5 }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }).map((_, idx) => {
        const v = idx + 1
        const active = v <= value
        return (
          <button
            key={v}
            className={'rounded-md px-2 py-1 text-sm font-extrabold ' + (active ? 'text-amber-600' : 'text-slate-300')}
            onClick={() => onChange(v)}
            aria-label={`${v} sao`}
          >
            ★
          </button>
        )
      })}
    </div>
  )
}

function findLessonLabel(syllabus, subjectId, lessonId) {
  const subject = syllabus.subjects.find((s) => s.id === subjectId)
  const lesson = subject?.lessons.find((l) => l.id === lessonId)
  if (!subject || !lesson) return null
  return { subject, lesson }
}

function LogbookEntryModal({ open, onClose, ctx, slotMeta, onSaved }) {
  const { classId, week, syllabus, students } = ctx

  const [loading, setLoading] = useState(true)
  const [entry, setEntry] = useState(null)

  const [rating, setRating] = useState(4)
  const [absentees, setAbsentees] = useState([])
  const [teacherNotes, setTeacherNotes] = useState('')

  const dayIndex = slotMeta?.dayIndex
  const slotIndex = slotMeta?.slotIndex

  const hasSlot = Number.isInteger(dayIndex) && Number.isInteger(slotIndex)

  const cellKey = hasSlot ? `${dayIndex}_${slotIndex}` : null
  const ref = cellKey ? syllabus.schedule.cells[cellKey] : null
  const lessonLabel = ref ? findLessonLabel(syllabus, ref.subjectId, ref.lessonId) : null

  useEffect(() => {
    let mounted = true
    async function load() {
      if (!open) return
      if (!hasSlot) return
      setLoading(true)
      const e = await logbookService.getEntry({ classId, week, dayIndex, slotIndex })
      if (!mounted) return
      setEntry(e)
      setRating(e?.rating ?? 4)
      setAbsentees(e?.absentees || [])
      setTeacherNotes(e?.teacherNotes || '')
      setLoading(false)
    }
    load()
    return () => {
      mounted = false
    }
  }, [open, classId, week, dayIndex, slotIndex, hasSlot])

  const status = entry?.status || 'empty'

  async function saveDraft() {
    const next = await logbookService.saveEntry({
      classId,
      week,
      dayIndex,
      slotIndex,
      entry: { rating, absentees, teacherNotes, status: 'draft' },
    })
    setEntry(next)
    onSaved?.()
  }

  async function signSubmit() {
    const next = await logbookService.signAndSubmit({
      classId,
      week,
      dayIndex,
      slotIndex,
      entry: { rating, absentees, teacherNotes },
      signedBy: 'Cô Hoa',
    })
    setEntry(next)
    onSaved?.()
    onClose?.()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        hasSlot
          ? `Sổ đầu bài · ${syllabus.schedule.days[dayIndex] || ''} · ${syllabus.schedule.slots?.[slotIndex]?.label || ''}`
          : 'Sổ đầu bài'
      }
      footer={
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs text-slate-600">
            Trạng thái: {status === 'completed' ? 'Hoàn thành' : status === 'draft' ? 'Nháp' : 'Chưa ghi'}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={saveDraft}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-extrabold text-slate-800"
            >
              Lưu nháp
            </button>
            <button
              onClick={signSubmit}
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-extrabold text-white"
            >
              <ClipboardSignature className="h-4 w-4" /> Ký & Nộp
            </button>
          </div>
        </div>
      }
    >
      {loading ? (
        <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">Đang tải...</div>
      ) : lessonLabel ? (
        <div className="space-y-4">
          <div className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-sm font-extrabold text-slate-900">
                  {lessonLabel.subject.name}: {lessonLabel.lesson.title}
                </div>
                <div className="mt-1 text-xs text-slate-600">Auto-sync từ Giáo án</div>
              </div>
              <Badge tone={status === 'completed' ? 'emerald' : status === 'draft' ? 'amber' : 'slate'}>
                {status === 'completed' ? 'Done' : status === 'draft' ? 'Draft' : '—'}
              </Badge>
            </div>
            <div className="mt-3">
              <div className="text-xs font-semibold text-slate-600">Nội dung (auto)</div>
              <div className="mt-1 text-sm text-slate-800">{lessonLabel.lesson.content}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="rounded-3xl border border-slate-100 bg-white p-4">
              <div className="text-xs font-semibold text-slate-600">Đánh giá tiết học</div>
              <div className="mt-2">
                <StarRating value={rating} onChange={setRating} />
              </div>
            </div>

            <div className="rounded-3xl border border-slate-100 bg-white p-4">
              <div className="text-xs font-semibold text-slate-600">Vắng mặt</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {students.map((s) => {
                  const active = absentees.includes(s.id)
                  return (
                    <button
                      key={s.id}
                      onClick={() =>
                        setAbsentees((prev) =>
                          prev.includes(s.id) ? prev.filter((x) => x !== s.id) : [...prev, s.id],
                        )
                      }
                      className={
                        'rounded-full px-3 py-1 text-xs font-semibold ring-1 ' +
                        (active
                          ? 'bg-rose-600 text-white ring-transparent'
                          : 'bg-white text-slate-700 ring-slate-200 hover:bg-slate-50')
                      }
                    >
                      {s.name.split(' ').slice(-1)[0]}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-100 bg-white p-4">
            <div className="text-xs font-semibold text-slate-600">Nhận xét của giáo viên</div>
            <textarea
              value={teacherNotes}
              onChange={(e) => setTeacherNotes(e.target.value)}
              rows={4}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
              placeholder="Ví dụ: Cả lớp tham gia tốt, cần thêm thời gian luyện tập..."
            />
          </div>

          {entry?.submittedAt ? (
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              Đã nộp lúc {new Date(entry.submittedAt).toLocaleString('vi-VN')}
            </div>
          ) : null}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600">
          Tiết này chưa gán bài học trong Giáo án. Vui lòng gán ở Giáo án/Schedule.
        </div>
      )}
    </Modal>
  )
}

export default function Logbook() {
  const { currentClassId, currentClass } = useTeacherClass()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [syllabus, setSyllabus] = useState(null)
  const [students, setStudents] = useState([])

  const [slotModal, setSlotModal] = useState(null) // {dayIndex, slotIndex}

  async function load() {
    setLoading(true)
    setError('')
    try {
      const s = await syllabusService.getSyllabus(currentClassId)
      // student list for absentees selection
      const classStudents = await teacherService.getClassList(currentClassId)
      setSyllabus(s)
      setStudents(classStudents)
    } catch (e) {
      console.error('Logbook load error:', e)
      setError(e?.message || 'Không tải được sổ đầu bài')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentClassId])

  function statusFor(dayIndex, slotIndex) {
    // We keep it simple: we won't load all entries upfront.
    // But we can show status badges based on cached in-memory query by trying to read synchronously is not possible.
    // So we display a neutral badge; status will be visible inside modal.
    return 'unknown'
  }

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-card">Đang tải sổ đầu bài...</div>
    )
  }

  if (error) {
    return (
      <div className="space-y-3 rounded-3xl border border-rose-100 bg-rose-50 p-6 shadow-card">
        <div className="text-sm font-extrabold text-rose-800">Không mở được Sổ đầu bài</div>
        <div className="text-sm text-rose-700">{error}</div>
        <div className="text-xs text-rose-700">
          Mở DevTools Console để xem log: <span className="font-semibold">Logbook load error</span>
        </div>
        <button
          onClick={load}
          className="w-fit rounded-2xl bg-rose-600 px-4 py-2 text-sm font-extrabold text-white"
        >
          Thử lại
        </button>
      </div>
    )
  }

  if (!syllabus) {
    return (
      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-card">
        Không có dữ liệu giáo án để hiển thị.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title={`Sổ đầu bài · ${currentClass?.name || `Lớp ${currentClassId}`}`}
        subtitle="Thời khoá biểu tuần (auto-sync Giáo án) + ghi nhận xét theo tiết."
        right={<Badge tone="sky">Tuần {syllabus.week}</Badge>}
      />

      <div className="overflow-auto rounded-3xl border border-slate-100 bg-white shadow-card">
        <div className="min-w-[920px] p-4">
          <div className="grid grid-cols-[180px_repeat(5,minmax(140px,1fr))] gap-2">
            <div />
            {syllabus.schedule.days.map((d) => (
              <div key={d} className="rounded-2xl bg-slate-900 px-3 py-2 text-xs font-extrabold text-white">
                {d}
              </div>
            ))}

            {syllabus.schedule.slots.map((slot, slotIndex) => (
              <React.Fragment key={slot.id}>
                <div className="rounded-2xl border border-slate-100 bg-white px-3 py-3">
                  <div className="text-sm font-extrabold">{slot.label}</div>
                  <div className="text-xs text-slate-500">{slot.time}</div>
                </div>

                {syllabus.schedule.days.map((_, dayIndex) => {
                  const key = `${dayIndex}_${slotIndex}`
                  const ref = syllabus.schedule.cells[key]
                  const lessonLabel = ref ? findLessonLabel(syllabus, ref.subjectId, ref.lessonId) : null

                  return (
                    <button
                      key={key}
                      onClick={() => setSlotModal({ dayIndex, slotIndex })}
                      className="rounded-3xl border border-slate-100 bg-white p-3 text-left transition hover:-translate-y-[1px] hover:shadow-card focus:outline-none focus:ring-4 focus:ring-sky-100"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-xs font-semibold text-slate-600">
                            {lessonLabel ? lessonLabel.subject.name : 'Chưa gán'}
                          </div>
                          <div className="mt-1 line-clamp-2 text-sm font-extrabold text-slate-900">
                            {lessonLabel ? lessonLabel.lesson.title : '—'}
                          </div>
                        </div>
                        <Badge tone="slate">{statusFor(dayIndex, slotIndex) === 'unknown' ? '—' : ''}</Badge>
                      </div>
                      <div className="mt-2 text-xs text-slate-500">Click để ghi sổ</div>
                    </button>
                  )
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <LogbookEntryModal
        open={!!slotModal}
        onClose={() => setSlotModal(null)}
        ctx={{ classId: currentClassId, week: syllabus.week, syllabus, students }}
        slotMeta={slotModal}
        onSaved={() => {
          // could refresh overall status if we implement batch status load later
        }}
      />
    </div>
  )
}
