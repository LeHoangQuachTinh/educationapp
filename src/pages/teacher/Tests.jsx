import React, { useEffect, useState } from 'react'
import { Plus, Eye, BarChart3, Trash2, Clock, Users, AlertTriangle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import PageHeader from '../../components/common/PageHeader'
import Badge from '../../components/common/Badge'
import Modal from '../../components/common/Modal'
import SoftButton from '../../components/common/SoftButton'
import { useAuth } from '../../context/AuthContext'
import { useTeacherClass } from '../../context/TeacherClassContext'
import { testService } from '../../services/mock/testService'
import { useToast } from '../../components/common/ToastContext'

function formatDateTime(ts) {
  return new Date(ts).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })
}

export default function TeacherTests() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { currentClassId, currentClass } = useTeacherClass()
  const { showToast } = useToast()

  const [tests, setTests] = useState([])
  const [loading, setLoading] = useState(true)
  const [createModalOpen, setCreateModalOpen] = useState(false)

  useEffect(() => {
    loadTests()
  }, [currentClassId])

  async function loadTests() {
    setLoading(true)
    const data = await testService.listTests({ classId: currentClassId })
    setTests(data)
    setLoading(false)
  }

  function getTestStatus(test) {
    const now = Date.now()
    if (now < test.startAt) return { label: 'Sắp tới', tone: 'amber' }
    if (now > test.endAt) return { label: 'Đã kết thúc', tone: 'slate' }
    return { label: 'Đang mở', tone: 'emerald' }
  }

  async function handleDelete(testId) {
    if (!confirm('Xóa bài kiểm tra này? Hành động không thể hoàn tác.')) return
    
    try {
      await testService.deleteTest(testId)
      showToast({ title: 'Đã xóa', message: 'Bài kiểm tra đã được xóa', tone: 'emerald' })
      await loadTests()
    } catch (e) {
      showToast({ title: 'Lỗi', message: e.message, tone: 'rose' })
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Bài kiểm tra"
        subtitle="Tạo và quản lý bài kiểm tra với tính năng chống gian lận"
        right={
          <div className="flex items-center gap-2">
            <Badge tone="sky">{currentClass?.name || `Lớp ${currentClassId}`}</Badge>
            <button
              onClick={() => setCreateModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-2xl bg-sky-600 px-4 py-2 text-sm font-extrabold text-white hover:bg-sky-700"
            >
              <Plus className="h-4 w-4" /> Tạo bài kiểm tra
            </button>
          </div>
        }
      />

      {loading ? (
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-card">
          <div className="text-sm font-semibold">Đang tải...</div>
        </div>
      ) : tests.length === 0 ? (
        <div className="rounded-3xl border border-slate-100 bg-white p-8 text-center shadow-card">
          <div className="text-4xl">📝</div>
          <div className="mt-3 text-sm font-extrabold text-slate-900">Chưa có bài kiểm tra</div>
          <div className="mt-1 text-sm text-slate-600">Tạo bài kiểm tra đầu tiên cho lớp</div>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {tests.map((test) => {
            const status = getTestStatus(test)
            return (
              <div key={test.id} className="rounded-3xl border border-slate-100 bg-white p-5 shadow-card">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone="sky">{test.subject}</Badge>
                      <Badge tone={status.tone}>{status.label}</Badge>
                      {test.type === 'EXAM' && <Badge tone="rose">Thi</Badge>}
                    </div>
                    <div className="mt-2 text-sm font-extrabold text-slate-900">{test.title}</div>
                    <div className="mt-2 text-xs text-slate-600">{test.description}</div>
                    
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-600">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" /> {test.duration} phút
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" /> {test.questions.length} câu
                      </div>
                      <div>Tổng: {test.totalPoints} điểm</div>
                    </div>

                    <div className="mt-2 text-xs text-slate-500">
                      Bắt đầu: {formatDateTime(test.startAt)} • Kết thúc: {formatDateTime(test.endAt)}
                    </div>
                  </div>

                  <div className="rounded-2xl bg-gradient-to-r from-sky-600 to-orange-500 px-3 py-2 text-center">
                    <div className="text-xs font-semibold text-white/90">Tổng điểm</div>
                    <div className="text-lg font-extrabold text-white">{test.totalPoints}</div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    onClick={() => navigate(`/teacher/test-analytics/${test.id}`)}
                    className="inline-flex items-center gap-2 rounded-2xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                  >
                    <BarChart3 className="h-4 w-4" /> Phân tích
                  </button>
                  <button
                    onClick={() => navigate(`/teacher/test-submissions/${test.id}`)}
                    className="inline-flex items-center gap-2 rounded-2xl bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-700 hover:bg-sky-100"
                  >
                    <Eye className="h-4 w-4" /> Bài làm
                  </button>
                  <button
                    onClick={() => handleDelete(test.id)}
                    className="inline-flex items-center gap-2 rounded-2xl bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                  >
                    <Trash2 className="h-4 w-4" /> Xóa
                  </button>
                </div>

                {test.randomizeQuestions && (
                  <div className="mt-3 flex items-center gap-2 rounded-2xl bg-amber-50 px-3 py-2 text-xs text-amber-700">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Câu hỏi được trộn ngẫu nhiên
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <CreateTestModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        classId={currentClassId}
        createdBy={user?.username}
        onSuccess={() => {
          loadTests()
          setCreateModalOpen(false)
        }}
      />
    </div>
  )
}

function CreateTestModal({ open, onClose, classId, createdBy, onSuccess }) {
  const { showToast } = useToast()
  const [creating, setCreating] = useState(false)

  const [subject, setSubject] = useState('Toán')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState('TEST')
  const [duration, setDuration] = useState(15)
  const [startAt, setStartAt] = useState('')
  const [endAt, setEndAt] = useState('')
  const [randomizeQuestions, setRandomizeQuestions] = useState(true)
  const [maxTabSwitches, setMaxTabSwitches] = useState(3)
  const [questions, setQuestions] = useState([])

  const [showQuestionForm, setShowQuestionForm] = useState(false)

  function addQuestion(question) {
    setQuestions([...questions, { ...question, id: `q${questions.length + 1}` }])
    setShowQuestionForm(false)
  }

  function removeQuestion(index) {
    setQuestions(questions.filter((_, i) => i !== index))
  }

  async function handleCreate() {
    if (!title.trim() || !startAt || !endAt || questions.length === 0) {
      showToast({ title: 'Thiếu thông tin', message: 'Vui lòng điền đầy đủ thông tin', tone: 'rose' })
      return
    }

    setCreating(true)
    try {
      await testService.createTest({
        classId,
        subject,
        title: title.trim(),
        description: description.trim(),
        type,
        duration: Number(duration),
        startAt: new Date(startAt).getTime(),
        endAt: new Date(endAt).getTime(),
        randomizeQuestions,
        allowCopyPaste: false,
        requireWebcam: false,
        maxTabSwitches: Number(maxTabSwitches),
        questions,
        createdBy,
      })

      showToast({ title: 'Thành công', message: 'Đã tạo bài kiểm tra', tone: 'emerald' })
      onSuccess()
    } catch (e) {
      showToast({ title: 'Lỗi', message: e.message, tone: 'rose' })
    } finally {
      setCreating(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Tạo bài kiểm tra mới"
      size="large"
      footer={
        <div className="flex items-center justify-end gap-2">
          <SoftButton onClick={onClose}>Hủy</SoftButton>
          <button
            onClick={handleCreate}
            disabled={creating}
            className="inline-flex items-center gap-2 rounded-2xl bg-sky-600 px-4 py-2 text-sm font-extrabold text-white disabled:opacity-50"
          >
            <Plus className="h-4 w-4" /> {creating ? 'Đang tạo...' : 'Tạo bài kiểm tra'}
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-xs font-semibold text-slate-600">Môn học</label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
            >
              <option>Toán</option>
              <option>Tiếng Việt</option>
              <option>Khoa học</option>
              <option>Tiếng Anh</option>
              <option>Lịch sử</option>
              <option>Địa lý</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600">Loại</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="TEST">Kiểm tra</option>
              <option value="EXAM">Thi</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-600">Tiêu đề</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="VD: Kiểm tra giữa kỳ - Phân số"
            className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-600">Mô tả</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="Hướng dẫn cho học sinh..."
            className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="text-xs font-semibold text-slate-600">Thời gian (phút)</label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              min="5"
              max="180"
              className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600">Bắt đầu</label>
            <input
              type="datetime-local"
              value={startAt}
              onChange={(e) => setStartAt(e.target.value)}
              className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600">Kết thúc</label>
            <input
              type="datetime-local"
              value={endAt}
              onChange={(e) => setEndAt(e.target.value)}
              className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="text-xs font-semibold text-slate-700">Cài đặt chống gian lận</div>
          
          <div className="mt-3 flex items-center gap-3">
            <input
              type="checkbox"
              id="randomize"
              checked={randomizeQuestions}
              onChange={(e) => setRandomizeQuestions(e.target.checked)}
              className="h-4 w-4"
            />
            <label htmlFor="randomize" className="text-sm text-slate-700">Trộn câu hỏi ngẫu nhiên</label>
          </div>

          <div className="mt-3">
            <label className="text-xs font-semibold text-slate-600">Giới hạn chuyển tab</label>
            <input
              type="number"
              value={maxTabSwitches}
              onChange={(e) => setMaxTabSwitches(e.target.value)}
              min="0"
              max="10"
              className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="border-t border-slate-200 pt-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-extrabold text-slate-900">Câu hỏi ({questions.length})</div>
            <button
              onClick={() => setShowQuestionForm(true)}
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
            >
              <Plus className="h-4 w-4" /> Thêm câu hỏi
            </button>
          </div>

          {questions.length === 0 ? (
            <div className="mt-3 rounded-2xl bg-slate-50 p-4 text-center text-sm text-slate-600">
              Chưa có câu hỏi. Nhấn "Thêm câu hỏi" để bắt đầu.
            </div>
          ) : (
            <div className="mt-3 space-y-2">
              {questions.map((q, idx) => (
                <div key={idx} className="flex items-start justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge tone={q.type === 'MULTIPLE_CHOICE' ? 'sky' : 'amber'}>
                        {q.type === 'MULTIPLE_CHOICE' ? 'Trắc nghiệm' : 'Tự luận'}
                      </Badge>
                      <Badge tone="slate">{q.points} điểm</Badge>
                    </div>
                    <div className="mt-2 text-sm font-semibold text-slate-900">{q.question}</div>
                    {q.type === 'MULTIPLE_CHOICE' && (
                      <div className="mt-2 text-xs text-slate-600">
                        Đáp án đúng: {q.options[q.correctAnswer]}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => removeQuestion(idx)}
                    className="rounded-xl bg-rose-50 p-2 text-rose-600 hover:bg-rose-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showQuestionForm && (
        <QuestionFormModal
          onClose={() => setShowQuestionForm(false)}
          onAdd={addQuestion}
        />
      )}
    </Modal>
  )
}

function QuestionFormModal({ onClose, onAdd }) {
  const [type, setType] = useState('MULTIPLE_CHOICE')
  const [question, setQuestion] = useState('')
  const [points, setPoints] = useState(2)
  const [options, setOptions] = useState(['', '', '', ''])
  const [correctAnswer, setCorrectAnswer] = useState(0)
  const [minWords, setMinWords] = useState(30)

  function handleAdd() {
    if (!question.trim()) return

    if (type === 'MULTIPLE_CHOICE') {
      if (options.some((o) => !o.trim())) {
        alert('Vui lòng điền đầy đủ các đáp án')
        return
      }
      onAdd({ type, question: question.trim(), options, correctAnswer, points: Number(points) })
    } else {
      onAdd({ type, question: question.trim(), points: Number(points), minWords: Number(minWords) })
    }
  }

  return (
    <Modal
      open={true}
      onClose={onClose}
      title="Thêm câu hỏi"
      footer={
        <div className="flex items-center justify-end gap-2">
          <SoftButton onClick={onClose}>Hủy</SoftButton>
          <button
            onClick={handleAdd}
            className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-extrabold text-white"
          >
            Thêm
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-xs font-semibold text-slate-600">Loại câu hỏi</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="MULTIPLE_CHOICE">Trắc nghiệm</option>
              <option value="ESSAY">Tự luận</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600">Điểm</label>
            <input
              type="number"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              min="0.5"
              step="0.5"
              className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-600">Câu hỏi</label>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            rows={3}
            placeholder="Nhập câu hỏi..."
            className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
          />
        </div>

        {type === 'MULTIPLE_CHOICE' ? (
          <>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-600">Các đáp án</label>
              {options.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="correct"
                    checked={correctAnswer === idx}
                    onChange={() => setCorrectAnswer(idx)}
                    className="h-4 w-4"
                  />
                  <input
                    value={opt}
                    onChange={(e) => {
                      const newOpts = [...options]
                      newOpts[idx] = e.target.value
                      setOptions(newOpts)
                    }}
                    placeholder={`Đáp án ${idx + 1}`}
                    className="flex-1 rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                  />
                </div>
              ))}
            </div>
          </>
        ) : (
          <div>
            <label className="text-xs font-semibold text-slate-600">Số từ tối thiểu</label>
            <input
              type="number"
              value={minWords}
              onChange={(e) => setMinWords(e.target.value)}
              min="10"
              className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
        )}
      </div>
    </Modal>
  )
}
