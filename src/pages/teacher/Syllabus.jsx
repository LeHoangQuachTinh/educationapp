import React, { useEffect, useMemo, useState } from 'react'
import { Loader2, Pencil, Presentation, Sparkles, Trash2 } from 'lucide-react'

import PageHeader from '../../components/common/PageHeader'
import { useTeacherClass } from '../../context/TeacherClassContext'
import { syllabusService } from '../../services/mock/syllabusService'

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

function LessonEditor({ open, onClose, initial, onSave }) {
  const [title, setTitle] = useState(initial?.title || '')
  const [objective, setObjective] = useState(initial?.objective || '')
  const [content, setContent] = useState(initial?.content || '')

  useEffect(() => {
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
          <button onClick={onClose} className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-extrabold text-slate-700">
            Huỷ
          </button>
          <button
            onClick={() => onSave({ ...initial, title, objective, content })}
            className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-extrabold text-white"
          >
            Lưu
          </button>
        </div>
      }
    >
      <div className="space-y-3">
        <div>
          <div className="text-xs font-semibold text-slate-600">Tiêu đề</div>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <div className="text-xs font-semibold text-slate-600">Mục tiêu</div>
          <textarea
            rows={3}
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
            className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <div className="text-xs font-semibold text-slate-600">Nội dung</div>
          <textarea
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
          />
        </div>
      </div>
    </Modal>
  )
}

export default function Syllabus() {
  const { currentClassId, currentClass } = useTeacherClass()

  const [loading, setLoading] = useState(true)
  const [syllabus, setSyllabus] = useState(null)

  const [editorOpen, setEditorOpen] = useState(false)
  const [editMeta, setEditMeta] = useState(null) // {subjectId, lesson}

  const [previewOpen, setPreviewOpen] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [slidesPayload, setSlidesPayload] = useState(null)

  async function load() {
    setLoading(true)
    const s = await syllabusService.getSyllabus(currentClassId)
    setSyllabus(s)
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentClassId])

  const lessonCount = useMemo(() => {
    if (!syllabus) return 0
    return syllabus.subjects.reduce((acc, s) => acc + s.lessons.length, 0)
  }, [syllabus])

  async function saveLesson(subjectId, lesson) {
    await syllabusService.upsertLesson({ classId: currentClassId, subjectId, lesson })
    await load()
  }

  async function deleteLesson(subjectId, lessonId) {
    await syllabusService.deleteLesson({ classId: currentClassId, subjectId, lessonId })
    await load()
  }

  async function onGenerate(subjectId, lessonId) {
    setPreviewOpen(true)
    setGenerating(true)
    setSlidesPayload(null)

    try {
      const payload = await syllabusService.generateSlides({ classId: currentClassId, subjectId, lessonId })
      setSlidesPayload(payload)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title={`Giáo án · ${currentClass?.name || `Lớp ${currentClassId}`}`}
        subtitle="CRUD bài học theo môn + mô phỏng AI tạo slides."
        right={
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">Tuần 12</span>
            <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-800">{lessonCount} bài</span>
          </div>
        }
      />

      {loading || !syllabus ? (
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-card">Đang tải giáo án...</div>
      ) : (
        <div className="space-y-4">
          {syllabus.subjects.map((sub) => (
            <div key={sub.id} className="rounded-3xl border border-slate-100 bg-white shadow-card">
              <div className="flex items-center justify-between border-b border-slate-100 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white">
                    <Presentation className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-extrabold text-slate-900">{sub.name}</div>
                    <div className="text-xs text-slate-600">{sub.lessons.length} bài</div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setEditMeta({ subjectId: sub.id, lesson: null })
                    setEditorOpen(true)
                  }}
                  className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-extrabold text-slate-800 hover:bg-slate-50"
                >
                  + Thêm bài
                </button>
              </div>

              <div className="p-4">
                <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                  {sub.lessons.map((lesson) => (
                    <div key={lesson.id} className="rounded-3xl border border-slate-100 bg-white p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-extrabold text-slate-900">{lesson.title}</div>
                          <div className="mt-1 line-clamp-2 text-xs text-slate-600">{lesson.objective}</div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            className="rounded-2xl px-2 py-2 text-slate-700 hover:bg-slate-100"
                            title="Chỉnh sửa"
                            onClick={() => {
                              setEditMeta({ subjectId: sub.id, lesson })
                              setEditorOpen(true)
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            className="rounded-2xl px-2 py-2 text-rose-700 hover:bg-rose-50"
                            title="Xoá"
                            onClick={() => deleteLesson(sub.id, lesson.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-3 rounded-2xl bg-slate-50 p-3">
                        <div className="text-xs font-semibold text-slate-600">Nội dung</div>
                        <div className="mt-1 line-clamp-3 text-sm text-slate-800">{lesson.content}</div>
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-2">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">ID: {lesson.id}</span>
                        <button
                          onClick={() => onGenerate(sub.id, lesson.id)}
                          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-extrabold text-slate-800 hover:bg-slate-50"
                        >
                          <Sparkles className="h-4 w-4 text-amber-600" /> ✨ Generate Slides
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <LessonEditor
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        initial={editMeta?.lesson}
        onSave={async (lesson) => {
          await saveLesson(editMeta.subjectId, lesson)
          setEditorOpen(false)
        }}
      />

      <Modal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title={slidesPayload?.title || 'Presentation Preview'}
        footer={
          <div className="text-xs text-slate-600">{generating ? 'Đang tạo nội dung...' : 'Bản xem trước slides (mock)'}</div>
        }
      >
        {generating ? (
          <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <Loader2 className="h-5 w-5 animate-spin text-sky-600" />
            <div>
              <div className="text-sm font-extrabold">AI đang “suy nghĩ”...</div>
              <div className="mt-1 text-xs text-slate-600">Mô phỏng bằng setTimeout (1200ms).</div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {slidesPayload?.slides?.map((s, idx) => (
              <SlideCard key={idx} slide={s} />
            ))}
          </div>
        )}
      </Modal>
    </div>
  )
}
