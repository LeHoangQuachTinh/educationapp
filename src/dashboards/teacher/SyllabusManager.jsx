import React, { useMemo, useState } from 'react'
import { Loader2, Pencil, Presentation, Sparkles, Trash2 } from 'lucide-react'

import { useApp } from '../../context/AppProvider'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Input, Textarea } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'

function SlideCard({ slide }) {
  const tone =
    slide.type === 'title'
      ? 'from-sky-500 to-emerald-500 text-white'
      : slide.type === 'theory'
        ? 'from-slate-900 to-slate-700 text-white'
        : slide.type === 'activity'
          ? 'from-amber-500 to-rose-500 text-white'
          : 'from-emerald-600 to-sky-600 text-white'

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-card">
      <div className={'bg-gradient-to-r ' + tone + ' px-4 py-3'}>
        <div className="text-sm font-extrabold">{slide.heading}</div>
        {slide.sub ? <div className="text-xs opacity-90">{slide.sub}</div> : null}
      </div>
      <div className="p-4">
        <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
          {(slide.bullets || []).map((b, idx) => (
            <li key={idx}>{b}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function PresentationPreviewModal({ open, onClose, payload, generating }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={payload?.title || 'Presentation Preview'}
      footer={
        <div className="flex items-center justify-between">
          <div className="text-xs text-slate-600">
            {generating ? 'Đang tạo nội dung...' : 'Bản xem trước HTML slides (mock)'}
          </div>
          <Button onClick={onClose}>Đóng</Button>
        </div>
      }
    >
      {generating ? (
        <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <Loader2 className="h-5 w-5 animate-spin text-sky-600" />
          <div>
            <div className="text-sm font-semibold">AI đang “suy nghĩ”...</div>
            <div className="text-xs text-slate-600">Mô phỏng bằng setTimeout. Nội dung sẽ hiện sau vài giây.</div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {payload?.slides?.map((s, idx) => (
            <SlideCard key={idx} slide={s} />
          ))}
        </div>
      )}
    </Modal>
  )
}

function LessonEditorModal({ open, onClose, initial, onSave }) {
  const [title, setTitle] = useState(initial?.title || '')
  const [objective, setObjective] = useState(initial?.objective || '')
  const [content, setContent] = useState(initial?.content || '')

  React.useEffect(() => {
    if (!open) return
    setTitle(initial?.title || '')
    setObjective(initial?.objective || '')
    setContent(initial?.content || '')
  }, [open, initial])

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial?.id ? 'Chỉnh sửa bài học' : 'Thêm bài học'}
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Huỷ
          </Button>
          <Button variant="success" onClick={() => onSave({ ...initial, title, objective, content })}>
            Lưu
          </Button>
        </div>
      }
    >
      <div className="space-y-3">
        <div>
          <div className="text-xs font-semibold text-slate-700">Tiêu đề</div>
          <div className="mt-1">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
        </div>
        <div>
          <div className="text-xs font-semibold text-slate-700">Mục tiêu</div>
          <div className="mt-1">
            <Textarea rows={3} value={objective} onChange={(e) => setObjective(e.target.value)} />
          </div>
        </div>
        <div>
          <div className="text-xs font-semibold text-slate-700">Nội dung</div>
          <div className="mt-1">
            <Textarea rows={4} value={content} onChange={(e) => setContent(e.target.value)} />
          </div>
        </div>
      </div>
    </Modal>
  )
}

export function SyllabusManager() {
  const { state, actions } = useApp()
  const week = state.syllabus.weeks[0]

  const [editorOpen, setEditorOpen] = useState(false)
  const [editMeta, setEditMeta] = useState(null) // {subjectId, lesson}

  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewPayload, setPreviewPayload] = useState(null)
  const [generating, setGenerating] = useState(false)

  const subjects = week.subjects

  const lessonCount = useMemo(() => subjects.reduce((acc, s) => acc + s.lessons.length, 0), [subjects])

  async function onGenerate(subjectId, lessonId) {
    setPreviewOpen(true)
    setGenerating(true)
    setPreviewPayload(null)

    const payload = await actions.generateSlides({ subjectId, lessonId })
    setPreviewPayload(payload)
    setGenerating(false)
  }

  return (
    <Card
      title="Syllabus Manager & AI Slide Generator"
      right={
        <div className="flex items-center gap-2">
          <Badge color="slate">Tuần {week.week}</Badge>
          <Badge color="blue">{lessonCount} bài</Badge>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-sm font-semibold">Cấu trúc: Tuần → Môn → Bài</div>
              <div className="mt-1 text-xs text-slate-600">Tên bài học tại Thời khoá biểu sẽ auto-sync từ đây.</div>
            </div>
            <div className="flex items-center gap-2">
              <Badge color="emerald">CRUD</Badge>
              <Badge color="amber">AI (mock)</Badge>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {subjects.map((sub) => (
            <div key={sub.id} className="rounded-2xl border border-slate-100">
              <div className="flex flex-col gap-2 border-b border-slate-100 p-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white">
                    <Presentation className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{sub.name}</div>
                    <div className="text-xs text-slate-600">{sub.lessons.length} bài · Tuần {week.week}</div>
                  </div>
                </div>

                <Button
                  variant="outline"
                  onClick={() => {
                    setEditMeta({ subjectId: sub.id, lesson: null })
                    setEditorOpen(true)
                  }}
                >
                  + Thêm bài
                </Button>
              </div>

              <div className="p-4">
                <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                  {sub.lessons.map((lesson) => (
                    <div key={lesson.id} className="rounded-2xl border border-slate-100 bg-white p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold">{lesson.title}</div>
                          <div className="mt-1 line-clamp-2 text-xs text-slate-600">{lesson.objective}</div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            className="px-2"
                            onClick={() => {
                              setEditMeta({ subjectId: sub.id, lesson })
                              setEditorOpen(true)
                            }}
                            title="Chỉnh sửa"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            className="px-2 text-rose-700 hover:bg-rose-50"
                            onClick={() =>
                              actions.deleteLesson({
                                week: week.week,
                                subjectId: sub.id,
                                lessonId: lesson.id,
                              })
                            }
                            title="Xoá"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="mt-3 rounded-2xl bg-slate-50 p-3">
                        <div className="text-xs font-semibold text-slate-700">Nội dung</div>
                        <div className="mt-1 line-clamp-3 text-sm text-slate-700">{lesson.content}</div>
                      </div>

                      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <Badge color="slate">ID: {lesson.id}</Badge>
                        <Button variant="outline" onClick={() => onGenerate(sub.id, lesson.id)}>
                          <Sparkles className="h-4 w-4 text-amber-600" /> ✨ Generate Slides
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-slate-100 p-4">
          <div className="text-xs font-semibold text-slate-700">Gợi ý UX</div>
          <div className="mt-2 text-sm text-slate-600">
            Khi giáo viên “Generate Slides”, hệ thống tạo 4 thẻ slide (Title, Theory, Activity, Homework) để có thể
            chỉnh sửa trước khi xuất bản.
          </div>
        </div>
      </div>

      <LessonEditorModal
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        initial={editMeta?.lesson}
        onSave={(lesson) => {
          actions.upsertLesson({
            week: week.week,
            subjectId: editMeta.subjectId,
            lesson: lesson.id ? lesson : { ...lesson, id: undefined },
          })
          setEditorOpen(false)
        }}
      />

      <PresentationPreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        payload={previewPayload}
        generating={generating}
      />
    </Card>
  )
}
