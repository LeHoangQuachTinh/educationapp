import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, AlertTriangle, Clock, CheckCircle2, XCircle, Edit3 } from 'lucide-react'

import PageHeader from '../../components/common/PageHeader'
import Badge from '../../components/common/Badge'
import Modal from '../../components/common/Modal'
import SoftButton from '../../components/common/SoftButton'
import { testService } from '../../services/mock/testService'
import { useToast } from '../../components/common/ToastContext'

function formatDateTime(ts) {
  return new Date(ts).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })
}

function formatDuration(ms) {
  const mins = Math.floor(ms / 60000)
  const secs = Math.floor((ms % 60000) / 1000)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export default function TestSubmissions() {
  const { testId } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [test, setTest] = useState(null)
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedSubmission, setSelectedSubmission] = useState(null)
  const [gradingQuestion, setGradingQuestion] = useState(null)

  useEffect(() => {
    loadData()
  }, [testId])

  async function loadData() {
    setLoading(true)
    const [testData, submissionsData] = await Promise.all([
      testService.getTest(testId),
      testService.getTestSubmissions(testId),
    ])
    setTest(testData)
    setSubmissions(submissionsData)
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-card">
          <div className="text-sm font-semibold">Đang tải bài nộp...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Bài làm của học sinh"
        subtitle={test?.title || 'Bài kiểm tra'}
        right={
          <button
            onClick={() => navigate('/teacher/tests')}
            className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-extrabold text-white"
          >
            <ArrowLeft className="h-4 w-4" /> Quay lại
          </button>
        }
      />

      {submissions.length === 0 ? (
        <div className="rounded-3xl border border-slate-100 bg-white p-8 text-center shadow-card">
          <div className="text-4xl">📝</div>
          <div className="mt-3 text-sm font-extrabold text-slate-900">Chưa có bài nộp</div>
          <div className="mt-1 text-sm text-slate-600">Học sinh chưa nộp bài kiểm tra</div>
        </div>
      ) : (
        <div className="space-y-3">
          {submissions.map((sub) => {
            const timeSpent = sub.submittedAt - sub.startedAt
            const hasCheatingFlags = sub.cheatingFlags && sub.cheatingFlags.length > 0

            return (
              <div
                key={sub.id}
                className={`rounded-3xl border p-5 shadow-card ${
                  hasCheatingFlags ? 'border-rose-200 bg-rose-50' : 'border-slate-100 bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone="sky">HS: {sub.studentId}</Badge>
                      <Badge tone={sub.status === 'SUBMITTED' ? 'emerald' : 'amber'}>
                        {sub.status === 'SUBMITTED' ? 'Đã nộp' : 'Đang làm'}
                      </Badge>
                      {sub.needsManualGrading && <Badge tone="amber">Cần chấm tay</Badge>}
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-700">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-slate-500" />
                        Thời gian: {formatDuration(timeSpent)}
                      </div>
                      {sub.status === 'SUBMITTED' && (
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          Nộp lúc: {formatDateTime(sub.submittedAt)}
                        </div>
                      )}
                    </div>

                    {hasCheatingFlags && (
                      <div className="mt-3 space-y-1">
                        {sub.cheatingFlags.map((flag, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 text-sm text-rose-700"
                          >
                            <AlertTriangle className="h-4 w-4" />
                            {flag.message}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="mt-3 text-xs text-slate-500">
                      Chuyển tab: {sub.tracking?.tabSwitches || 0} lần • Copy: {sub.tracking?.copyAttempts || 0} lần
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="rounded-2xl bg-gradient-to-r from-sky-600 to-orange-500 px-4 py-3 text-center">
                      <div className="text-xs font-semibold text-white/90">Điểm</div>
                      <div className="text-2xl font-extrabold text-white">
                        {sub.earnedPoints?.toFixed(1) || 0}
                      </div>
                      <div className="text-xs text-white/90">/ {test.totalPoints}</div>
                    </div>

                    <button
                      onClick={() => setSelectedSubmission(sub)}
                      className="mt-2 w-full rounded-2xl bg-sky-600 px-4 py-2 text-xs font-extrabold text-white hover:bg-sky-700"
                    >
                      Xem chi tiết
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {selectedSubmission && (
        <SubmissionDetailModal
          submission={selectedSubmission}
          test={test}
          onClose={() => setSelectedSubmission(null)}
          onGradeQuestion={(question) => {
            setGradingQuestion(question)
          }}
          onReload={loadData}
        />
      )}

      {gradingQuestion && (
        <GradeEssayModal
          submission={selectedSubmission}
          question={gradingQuestion}
          onClose={() => setGradingQuestion(null)}
          onSuccess={() => {
            loadData()
            setGradingQuestion(null)
          }}
        />
      )}
    </div>
  )
}

function SubmissionDetailModal({ submission, test, onClose, onGradeQuestion, onReload }) {
  return (
    <Modal
      open={true}
      onClose={onClose}
      title={`Bài làm của ${submission.studentId}`}
      size="large"
      footer={
        <div className="flex items-center justify-end">
          <SoftButton onClick={onClose}>Đóng</SoftButton>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="grid gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">Điểm:</span>
              <span className="font-extrabold text-slate-900">
                {submission.earnedPoints?.toFixed(1) || 0} / {test.totalPoints}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Thời gian làm bài:</span>
              <span className="font-semibold">{formatDuration(submission.submittedAt - submission.startedAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Chuyển tab:</span>
              <span className={`font-semibold ${submission.tracking?.tabSwitches > test.maxTabSwitches ? 'text-rose-600' : ''}`}>
                {submission.tracking?.tabSwitches || 0} lần
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {submission.gradedQuestions?.map((q, idx) => (
            <div key={q.id} className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge tone="slate">Câu {idx + 1}</Badge>
                    <Badge tone={q.type === 'MULTIPLE_CHOICE' ? 'sky' : 'amber'}>
                      {q.type === 'MULTIPLE_CHOICE' ? 'Trắc nghiệm' : 'Tự luận'}
                    </Badge>
                    <Badge tone="slate">{q.points} điểm</Badge>
                  </div>

                  <div className="mt-2 text-sm font-semibold text-slate-900">{q.question}</div>

                  {q.type === 'MULTIPLE_CHOICE' ? (
                    <>
                      <div className="mt-3 space-y-2">
                        {q.options?.map((opt, optIdx) => (
                          <div
                            key={optIdx}
                            className={`rounded-xl border px-3 py-2 text-sm ${
                              optIdx === q.correctAnswer
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                                : optIdx === q.studentAnswer
                                ? 'border-rose-200 bg-rose-50 text-rose-900'
                                : 'border-slate-200 bg-slate-50 text-slate-700'
                            }`}
                          >
                            {opt}
                            {optIdx === q.correctAnswer && ' ✓ (Đáp án đúng)'}
                            {optIdx === q.studentAnswer && optIdx !== q.correctAnswer && ' ✗ (Học sinh chọn)'}
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                        {q.studentAnswer || '(Không có câu trả lời)'}
                      </div>

                      {q.gradedAt ? (
                        <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                          <div className="text-xs font-semibold text-emerald-700">Nhận xét của giáo viên:</div>
                          <div className="mt-1 text-sm text-emerald-900">{q.feedback || 'Không có nhận xét'}</div>
                        </div>
                      ) : (
                        <button
                          onClick={() => onGradeQuestion(q)}
                          className="mt-3 inline-flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-100"
                        >
                          <Edit3 className="h-3.5 w-3.5" /> Chấm điểm
                        </button>
                      )}
                    </>
                  )}
                </div>

                <div className="text-right">
                  {q.isCorrect === true ? (
                    <div className="flex items-center gap-1 text-emerald-600">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                  ) : q.isCorrect === false ? (
                    <div className="flex items-center gap-1 text-rose-600">
                      <XCircle className="h-5 w-5" />
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500">Chưa chấm</div>
                  )}
                  <div className="mt-2 text-xs font-semibold text-slate-600">
                    {q.pointsEarned?.toFixed(1) || 0} / {q.points}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  )
}

function GradeEssayModal({ submission, question, onClose, onSuccess }) {
  const { showToast } = useToast()
  const [points, setPoints] = useState(question.pointsEarned || 0)
  const [feedback, setFeedback] = useState(question.feedback || '')
  const [grading, setGrading] = useState(false)

  async function handleGrade() {
    if (Number(points) > question.points) {
      showToast({ title: 'Lỗi', message: 'Điểm không được vượt quá điểm tối đa', tone: 'rose' })
      return
    }

    setGrading(true)
    try {
      await testService.gradeEssay({
        attemptId: submission.id,
        questionId: question.id,
        points: Number(points),
        feedback: feedback.trim(),
      })

      showToast({ title: 'Thành công', message: 'Đã chấm điểm câu tự luận', tone: 'emerald' })
      onSuccess()
    } catch (e) {
      showToast({ title: 'Lỗi', message: e.message, tone: 'rose' })
    } finally {
      setGrading(false)
    }
  }

  return (
    <Modal
      open={true}
      onClose={onClose}
      title="Chấm điểm câu tự luận"
      footer={
        <div className="flex items-center justify-end gap-2">
          <SoftButton onClick={onClose}>Hủy</SoftButton>
          <button
            onClick={handleGrade}
            disabled={grading}
            className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-extrabold text-white disabled:opacity-50"
          >
            {grading ? 'Đang lưu...' : 'Lưu điểm'}
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        <div>
          <div className="text-xs font-semibold text-slate-600">Câu hỏi</div>
          <div className="mt-1 text-sm text-slate-900">{question.question}</div>
        </div>

        <div>
          <div className="text-xs font-semibold text-slate-600">Câu trả lời của học sinh</div>
          <div className="mt-1 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
            {question.studentAnswer || '(Không có câu trả lời)'}
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-600">Điểm (tối đa: {question.points})</label>
          <input
            type="number"
            value={points}
            onChange={(e) => setPoints(e.target.value)}
            min="0"
            max={question.points}
            step="0.5"
            className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-600">Nhận xét</label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={4}
            placeholder="Nhận xét cho học sinh..."
            className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
          />
        </div>
      </div>
    </Modal>
  )
}
