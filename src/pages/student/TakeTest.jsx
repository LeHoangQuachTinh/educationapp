import React, { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Clock, AlertTriangle, Send, Save } from 'lucide-react'

import Badge from '../../components/common/Badge'
import Modal from '../../components/common/Modal'
import SoftButton from '../../components/common/SoftButton'
import { useAuth } from '../../context/AuthContext'
import { testService } from '../../services/mock/testService'
import { useToast } from '../../components/common/ToastContext'

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export default function TakeTest() {
  const { testId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { showToast } = useToast()

  const [test, setTest] = useState(null)
  const [attempt, setAttempt] = useState(null)
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)
  const [showWarningModal, setShowWarningModal] = useState(false)
  const [warningMessage, setWarningMessage] = useState('')

  // Anti-cheating tracking
  const [tabSwitches, setTabSwitches] = useState(0)
  const [copyAttempts, setCopyAttempts] = useState(0)
  const autoSaveInterval = useRef(null)
  const timeInterval = useRef(null)
  const isPageVisible = useRef(true)
  const answersRef = useRef({})

  useEffect(() => {
    startTest()
    return () => {
      if (autoSaveInterval.current) clearInterval(autoSaveInterval.current)
      if (timeInterval.current) clearInterval(timeInterval.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testId])

  async function startTest() {
    setLoading(true)
    try {
      const testData = await testService.getTest(testId)
      const attemptData = await testService.startTestAttempt({ testId, studentId: user.id })

      setTest(testData)
      setAttempt(attemptData)
      setTimeLeft(Math.floor((attemptData.endAt - Date.now()) / 1000))

      // Load existing answers if any
      const existingAnswers = {}
      attemptData.questions.forEach((q) => {
        existingAnswers[q.id] = null
      })
      setAnswers(existingAnswers)
      answersRef.current = existingAnswers

      // Setup auto-save
      autoSaveInterval.current = setInterval(() => {
        autoSave(attemptData.id)
      }, 30000) // every 30 seconds

      // Setup timer
      timeInterval.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleAutoSubmit(attemptData.id)
            return 0
          }
          return prev - 1
        })
      }, 1000)

      setLoading(false)
    } catch (e) {
      showToast({ title: 'Lỗi', message: e.message, tone: 'rose' })
      navigate('/student/tests')
    }
  }

  // Anti-cheating: Track tab switches
  useEffect(() => {
    function handleVisibilityChange() {
      if (document.hidden && isPageVisible.current && attempt) {
        isPageVisible.current = false
        setTabSwitches((prev) => {
          const newCount = prev + 1
          testService.trackActivity({
            attemptId: attempt.id,
            type: 'TAB_SWITCH',
            details: `Chuyển tab lần ${newCount}`,
          })

          if (newCount > test?.maxTabSwitches) {
            setWarningMessage(
              `Bạn đã chuyển tab ${newCount} lần (giới hạn: ${test.maxTabSwitches}). Hành vi này sẽ được báo cáo cho giáo viên.`
            )
            setShowWarningModal(true)
          }

          return newCount
        })
      } else if (!document.hidden) {
        isPageVisible.current = true
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [attempt, test])

  // Anti-cheating: Block copy
  useEffect(() => {
    function handleCopy(e) {
      if (test && !test.allowCopyPaste && attempt) {
        e.preventDefault()
        setCopyAttempts((prev) => {
          const newCount = prev + 1
          testService.trackActivity({
            attemptId: attempt.id,
            type: 'COPY_ATTEMPT',
            details: `Thử copy lần ${newCount}`,
          })
          showToast({ title: 'Không được phép', message: 'Không được copy nội dung đề bài', tone: 'rose' })
          return newCount
        })
      }
    }

    function handlePaste(e) {
      if (test && !test.allowCopyPaste && attempt) {
        // Allow paste in answer fields
        const target = e.target
        if (target.tagName === 'TEXTAREA' || target.tagName === 'INPUT') {
          return
        }
        e.preventDefault()
      }
    }

    document.addEventListener('copy', handleCopy)
    document.addEventListener('paste', handlePaste)
    return () => {
      document.removeEventListener('copy', handleCopy)
      document.removeEventListener('paste', handlePaste)
    }
  }, [test, attempt])

  // Prevent page refresh/close
  useEffect(() => {
    function handleBeforeUnload(e) {
      if (attempt && attempt.status !== 'SUBMITTED') {
        e.preventDefault()
        e.returnValue = 'Bài làm chưa được nộp. Bạn có chắc muốn thoát?'
        return e.returnValue
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [attempt])

  async function autoSave(attemptId) {
    if (!attemptId) return
    try {
      for (const [questionId, answer] of Object.entries(answersRef.current)) {
        if (answer !== null) {
          await testService.saveAnswer({ attemptId, questionId, answer })
        }
      }
    } catch (e) {
      console.error('Auto-save failed:', e)
    }
  }

  async function handleAutoSubmit(attemptId) {
    if (!attemptId) return
    try {
      // Save all answers first
      await autoSave(attemptId)
      // Submit
      await testService.submitTest({ attemptId, force: true })
      showToast({ title: 'Hết giờ', message: 'Bài kiểm tra đã được tự động nộp', tone: 'amber' })
      navigate('/student/tests')
    } catch (e) {
      showToast({ title: 'Lỗi', message: e.message, tone: 'rose' })
    }
  }

  async function handleSubmit() {
    if (!attempt) return

    // Check if all questions answered
    const unanswered = attempt.questions.filter((q) => answers[q.id] === null || answers[q.id] === '')
    if (unanswered.length > 0) {
      if (!confirm(`Còn ${unanswered.length} câu chưa trả lời. Bạn có chắc muốn nộp bài?`)) {
        return
      }
    }

    setSubmitting(true)
    try {
      // Save all answers
      await autoSave(attempt.id)

      // Submit test
      const result = await testService.submitTest({ attemptId: attempt.id })

      showToast({
        title: 'Nộp bài thành công',
        message: `Điểm: ${result.earnedPoints?.toFixed(1)} / ${test.totalPoints}`,
        tone: 'emerald',
      })

      // Clear intervals
      if (autoSaveInterval.current) clearInterval(autoSaveInterval.current)
      if (timeInterval.current) clearInterval(timeInterval.current)

      navigate('/student/tests')
    } catch (e) {
      showToast({ title: 'Lỗi', message: e.message, tone: 'rose' })
    } finally {
      setSubmitting(false)
    }
  }

  function handleAnswerChange(questionId, value) {
    const newAnswers = { ...answersRef.current, [questionId]: value }
    setAnswers(newAnswers)
    answersRef.current = newAnswers
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-6">
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-card">
          <div className="text-sm font-semibold">Đang khởi động bài kiểm tra...</div>
          <div className="mt-2 text-sm text-slate-600">Vui lòng chờ</div>
        </div>
      </div>
    )
  }

  if (!test || !attempt) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-6">
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-center shadow-card">
          <div className="text-sm font-semibold text-rose-700">Không thể tải bài kiểm tra</div>
        </div>
      </div>
    )
  }

  const progress = attempt.questions.filter((q) => answers[q.id] !== null && answers[q.id] !== '').length
  const isTimeAlmostUp = timeLeft < 60 // less than 1 minute

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Fixed Header */}
      <div className="sticky top-0 z-50 border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto max-w-4xl px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <div className="text-sm font-extrabold text-slate-900">{test.title}</div>
              <div className="mt-1 text-xs text-slate-600">
                {progress} / {attempt.questions.length} câu đã trả lời
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Timer */}
              <div
                className={`flex items-center gap-2 rounded-2xl px-3 py-2 ${
                  isTimeAlmostUp ? 'bg-rose-100 text-rose-700' : 'bg-sky-100 text-sky-700'
                }`}
              >
                <Clock className="h-4 w-4" />
                <span className="text-sm font-extrabold">{formatTime(timeLeft)}</span>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-sky-600 to-orange-500 px-4 py-2 text-sm font-extrabold text-white shadow-card disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                {submitting ? 'Đang nộp...' : 'Nộp bài'}
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-1.5 bg-gradient-to-r from-sky-600 to-orange-500 transition-all"
              style={{ width: `${(progress / attempt.questions.length) * 100}%` }}
            />
          </div>

          {/* Warnings */}
          {(tabSwitches > 0 || copyAttempts > 0) && (
            <div className="mt-2 flex items-center gap-3 text-xs">
              {tabSwitches > 0 && (
                <Badge tone={tabSwitches > test.maxTabSwitches ? 'rose' : 'amber'}>
                  <AlertTriangle className="mr-1 inline h-3 w-3" />
                  Chuyển tab: {tabSwitches} lần
                </Badge>
              )}
              {copyAttempts > 0 && (
                <Badge tone="rose">
                  <AlertTriangle className="mr-1 inline h-3 w-3" />
                  Thử copy: {copyAttempts} lần
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Questions */}
      <div className="mx-auto max-w-4xl p-4 md:p-6">
        <div className="space-y-4">
          {attempt.questions.map((question, idx) => (
            <div key={question.id} className="rounded-3xl border border-slate-100 bg-white p-5 shadow-card">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge tone="sky">Câu {idx + 1}</Badge>
                    <Badge tone={question.type === 'MULTIPLE_CHOICE' ? 'emerald' : 'amber'}>
                      {question.type === 'MULTIPLE_CHOICE' ? 'Trắc nghiệm' : 'Tự luận'}
                    </Badge>
                    <Badge tone="slate">{question.points} điểm</Badge>
                  </div>

                  <div className="mt-3 text-sm font-semibold text-slate-900">{question.question}</div>

                  {question.type === 'MULTIPLE_CHOICE' ? (
                    <div className="mt-4 space-y-2">
                      {question.options.map((option, optIdx) => (
                        <label
                          key={optIdx}
                          className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-3 transition ${
                            answers[question.id] === optIdx
                              ? 'border-sky-300 bg-sky-50'
                              : 'border-slate-200 bg-white hover:bg-slate-50'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`question_${question.id}`}
                            checked={answers[question.id] === optIdx}
                            onChange={() => handleAnswerChange(question.id, optIdx)}
                            className="h-4 w-4"
                          />
                          <span className="text-sm text-slate-900">{option}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-4">
                      <textarea
                        value={answers[question.id] || ''}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                        rows={6}
                        placeholder="Nhập câu trả lời của bạn..."
                        className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                      />
                      {question.minWords && (
                        <div className="mt-2 text-xs text-slate-500">
                          Yêu cầu tối thiểu: {question.minWords} từ
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {answers[question.id] !== null && answers[question.id] !== '' && (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <Save className="h-4 w-4" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Submit */}
        <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-card">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-slate-900">Sẵn sàng nộp bài?</div>
              <div className="mt-1 text-sm text-slate-600">
                Đã trả lời {progress} / {attempt.questions.length} câu
              </div>
            </div>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-sky-600 to-orange-500 px-6 py-3 text-sm font-extrabold text-white shadow-card disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              {submitting ? 'Đang nộp bài...' : 'Nộp bài'}
            </button>
          </div>
        </div>
      </div>

      {/* Warning Modal */}
      <Modal
        open={showWarningModal}
        onClose={() => setShowWarningModal(false)}
        title="Cảnh báo"
        footer={
          <div className="flex items-center justify-end">
            <button
              onClick={() => setShowWarningModal(false)}
              className="rounded-2xl bg-amber-600 px-4 py-2 text-sm font-extrabold text-white"
            >
              Tôi hiểu
            </button>
          </div>
        }
      >
        <div className="space-y-3">
          <div className="flex items-center gap-3 rounded-2xl bg-amber-50 p-4">
            <AlertTriangle className="h-6 w-6 text-amber-600" />
            <div className="flex-1 text-sm text-amber-900">{warningMessage}</div>
          </div>
          <div className="text-sm text-slate-600">
            Hành vi gian lận sẽ bị ghi nhận và báo cáo cho giáo viên. Hãy làm bài trung thực.
          </div>
        </div>
      </Modal>
    </div>
  )
}
