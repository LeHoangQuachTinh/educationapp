import React, { useMemo, useState } from 'react'
import { CheckCircle2, ClipboardSignature } from 'lucide-react'

import { useApp } from '../../context/AppProvider'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { Button } from '../../components/ui/Button'
import { StarRating } from '../../components/ui/StarRating'
import { Textarea } from '../../components/ui/Input'

function LogbookModal({ open, onClose, slotMeta }) {
  const { state, selectors, actions } = useApp()
  const [rating, setRating] = useState(4)
  const [teacherNotes, setTeacherNotes] = useState('')
  const [absentees, setAbsentees] = useState([])

  const dayIndex = slotMeta?.dayIndex
  const slotIndex = slotMeta?.slotIndex

  const lesson = slotMeta ? selectors.getLessonLabelForCell(dayIndex, slotIndex) : null

  const existing = useMemo(() => {
    if (!slotMeta) return null
    return selectors.getLogbookEntry(state.schedule.week, dayIndex, slotIndex)
  }, [slotMeta, selectors, state.schedule.week, dayIndex, slotIndex])

  React.useEffect(() => {
    if (!open) return
    const base = existing || {}
    setRating(base.rating || 4)
    setTeacherNotes(base.teacherNotes || '')
    setAbsentees(base.absentees || [])
  }, [open, existing])

  const isCompleted = existing?.status === 'completed'

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        lesson
          ? `Sổ đầu bài · ${state.schedule.template.days[dayIndex]} · ${state.schedule.template.slots[slotIndex].label}`
          : 'Sổ đầu bài'
      }
      footer={
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs text-slate-600">
            {isCompleted ? 'Trạng thái: Hoàn thành' : 'Trạng thái: Nháp'}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => {
                actions.saveLogbookEntry({
                  week: state.schedule.week,
                  dayIndex,
                  slotIndex,
                  entry: { rating, teacherNotes, absentees, status: 'draft' },
                })
              }}
            >
              Lưu nháp
            </Button>
            <Button
              variant="success"
              onClick={() => {
                actions.signAndSubmitLogbook({
                  week: state.schedule.week,
                  dayIndex,
                  slotIndex,
                  entry: { rating, teacherNotes, absentees },
                })
              }}
            >
              <ClipboardSignature className="h-4 w-4" /> Ký & Nộp
            </Button>
          </div>
        </div>
      }
    >
      {lesson ? (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="text-sm font-semibold">
                  {lesson.subjectName}: {lesson.lessonTitle}
                </div>
                <div className="mt-1 text-xs text-slate-600">Auto-sync từ Syllabus Manager</div>
              </div>
              <Badge color={isCompleted ? 'emerald' : 'slate'}>
                {isCompleted ? 'Completed' : 'Draft'}
              </Badge>
            </div>
            <div className="mt-3 text-sm text-slate-700">
              <div className="text-xs font-semibold text-slate-600">Nội dung (auto)</div>
              <div className="mt-1">{lesson.lesson.content}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-100 p-4">
              <div className="text-xs font-semibold text-slate-700">Đánh giá tiết học</div>
              <div className="mt-2">
                <StarRating value={rating} onChange={setRating} />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-100 p-4">
              <div className="text-xs font-semibold text-slate-700">Vắng mặt</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {state.students.map((s) => {
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
                      {s.nickname}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 p-4">
            <div className="text-xs font-semibold text-slate-700">Nhận xét của giáo viên</div>
            <div className="mt-2">
              <Textarea
                value={teacherNotes}
                onChange={(e) => setTeacherNotes(e.target.value)}
                rows={4}
                placeholder="Ví dụ: Cả lớp tham gia tốt, cần thêm thời gian luyện tập..."
              />
            </div>
          </div>

          {existing?.submittedAt ? (
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              Đã nộp lúc {new Date(existing.submittedAt).toLocaleString('vi-VN')}
            </div>
          ) : null}
        </div>
      ) : (
        <div className="text-sm text-slate-600">
          Ô này chưa gán bài học trong Syllabus. Hãy cập nhật ở phần Kế hoạch bài dạy.
        </div>
      )}
    </Modal>
  )
}

export function ScheduleLogbook() {
  const { state, selectors } = useApp()
  const [selectedSlot, setSelectedSlot] = useState(null)

  const days = state.schedule.template.days
  const slots = state.schedule.template.slots

  const statusForCell = (dayIndex, slotIndex) => {
    const entry = selectors.getLogbookEntry(state.schedule.week, dayIndex, slotIndex)
    return entry?.status || 'empty'
  }

  return (
    <Card title="Thời khóa biểu tuần & Sổ đầu bài" right={<Badge color="blue">Click ô để mở Sổ Đầu Bài</Badge>}>
      <div className="overflow-auto">
        <div className="min-w-[920px]">
          <div className="grid grid-cols-[180px_repeat(5,minmax(140px,1fr))] gap-2">
            <div />
            {days.map((d) => (
              <div key={d} className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white">
                {d}
              </div>
            ))}

            {slots.map((slot, slotIndex) => (
              <React.Fragment key={slot.id}>
                <div className="rounded-xl border border-slate-100 bg-white px-3 py-3">
                  <div className="text-sm font-semibold">{slot.label}</div>
                  <div className="text-xs text-slate-500">{slot.time}</div>
                </div>

                {days.map((_, dayIndex) => {
                  const lesson = selectors.getLessonLabelForCell(dayIndex, slotIndex)
                  const status = statusForCell(dayIndex, slotIndex)
                  return (
                    <button
                      key={`${dayIndex}_${slotIndex}`}
                      onClick={() => setSelectedSlot({ dayIndex, slotIndex })}
                      className={
                        'rounded-2xl border p-3 text-left transition hover:-translate-y-[1px] hover:shadow-card focus:outline-none focus:ring-4 focus:ring-sky-100 ' +
                        (status === 'completed'
                          ? 'border-emerald-100 bg-emerald-50'
                          : status === 'draft'
                            ? 'border-amber-100 bg-amber-50'
                            : 'border-slate-100 bg-white')
                      }
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-xs font-semibold text-slate-700">
                            {lesson ? lesson.subjectName : 'Chưa gán'}
                          </div>
                          <div className="mt-1 line-clamp-2 text-sm font-semibold">
                            {lesson ? lesson.lessonTitle : '—'}
                          </div>
                        </div>
                        <Badge color={status === 'completed' ? 'emerald' : status === 'draft' ? 'amber' : 'slate'}>
                          {status === 'completed' ? 'Done' : status === 'draft' ? 'Draft' : '—'}
                        </Badge>
                      </div>
                      <div className="mt-2 text-xs text-slate-500">Auto-sync bài học · mở logbook</div>
                    </button>
                  )
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <LogbookModal open={!!selectedSlot} onClose={() => setSelectedSlot(null)} slotMeta={selectedSlot} />
    </Card>
  )
}
