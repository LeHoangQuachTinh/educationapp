import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Clock, AlertTriangle, CheckCircle2, Play, Lock, Calendar } from 'lucide-react'

import PageHeader from '../../components/common/PageHeader'
import Badge from '../../components/common/Badge'
import { useAuth } from '../../context/AuthContext'
import { testService } from '../../services/mock/testService'

function formatDateTime(ts) {
  return new Date(ts).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })
}

function getTestStatus(test, attempt) {
  const now = Date.now()
  
  if (attempt?.status === 'SUBMITTED') {
    return { label: 'Đã nộp', tone: 'emerald', canStart: false }
  }
  
  if (attempt?.status === 'IN_PROGRESS') {
    return { label: 'Đang làm', tone: 'amber', canStart: true }
  }
  
  if (now < test.startAt) {
    return { label: 'Chưa mở', tone: 'slate', canStart: false }
  }
  
  if (now > test.endAt) {
    return { label: 'Đã đóng', tone: 'rose', canStart: false }
  }
  
  return { label: 'Có thể làm', tone: 'emerald', canStart: true }
}

export default function StudentTests() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [tests, setTests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTests()
  }, [user.id])

  async function loadTests() {
    setLoading(true)
    const data = await testService.listTests({ classId: '5A', studentId: user.id })
    setTests(data)
    setLoading(false)
  }

  return (
    <div className="space-y-4 p-4 pb-24 md:p-6 md:pb-6">
      <PageHeader
        title="Bài kiểm tra"
        subtitle="Làm bài kiểm tra online với giám sát chống gian lận"
        right={
          <div className="flex items-center gap-2">
            <Badge tone="emerald">💰 {user.points ?? 0} điểm</Badge>
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
          <div className="mt-1 text-sm text-slate-600">Giáo viên chưa giao bài kiểm tra mới</div>
        </div>
      ) : (
        <div className="space-y-4">
          {tests.map((test) => {
            const status = getTestStatus(test, test.attempt)
            
            return (
              <div
                key={test.id}
                className={`rounded-3xl border p-5 shadow-card ${
                  status.canStart ? 'border-emerald-200 bg-emerald-50' : 'border-slate-100 bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone="sky">{test.subject}</Badge>
                      <Badge tone={status.tone}>{status.label}</Badge>
                      {test.type === 'EXAM' && <Badge tone="rose">Thi</Badge>}
                    </div>

                    <div className="mt-2 text-sm font-extrabold text-slate-900">{test.title}</div>
                    <div className="mt-2 text-sm text-slate-600">{test.description}</div>

                    <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-600">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" /> {test.duration} phút
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" /> {formatDateTime(test.startAt)}
                      </div>
                      <div>{test.questions.length} câu • {test.totalPoints} điểm</div>
                    </div>

                    {test.attempt?.status === 'SUBMITTED' && (
                      <div className="mt-3 flex items-center gap-3">
                        <div className="text-sm font-semibold text-emerald-700">
                          Điểm: {test.attempt.earnedPoints?.toFixed(1)} / {test.totalPoints}
                        </div>
                        {test.attempt.needsManualGrading && (
                          <Badge tone="amber">Chờ chấm điểm tự luận</Badge>
                        )}
                      </div>
                    )}

                    {test.attempt?.status === 'IN_PROGRESS' && (
                      <div className="mt-3 flex items-center gap-2 text-sm text-amber-700">
                        <AlertTriangle className="h-4 w-4" />
                        Bài làm chưa hoàn thành - tiếp tục làm bài
                      </div>
                    )}
                  </div>

                  <div className="text-right">
                    {status.canStart ? (
                      <button
                        onClick={() => navigate(`/student/take-test/${test.id}`)}
                        className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-sky-600 to-orange-500 px-4 py-3 text-sm font-extrabold text-white shadow-card hover:opacity-90"
                      >
                        {test.attempt?.status === 'IN_PROGRESS' ? (
                          <>
                            <Play className="h-4 w-4" /> Tiếp tục
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4" /> Bắt đầu
                          </>
                        )}
                      </button>
                    ) : test.attempt?.status === 'SUBMITTED' ? (
                      <div className="inline-flex items-center gap-2 rounded-2xl bg-emerald-100 px-4 py-3 text-sm font-extrabold text-emerald-700">
                        <CheckCircle2 className="h-4 w-4" /> Đã nộp
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-3 text-sm font-extrabold text-slate-500">
                        <Lock className="h-4 w-4" /> Không khả dụng
                      </div>
                    )}
                  </div>
                </div>

                {(status.canStart || test.attempt?.status === 'IN_PROGRESS') && (
                  <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-3">
                    <div className="flex items-start gap-2 text-xs text-amber-800">
                      <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                      <div>
                        <div className="font-semibold">Lưu ý quan trọng:</div>
                        <ul className="mt-1 list-inside list-disc space-y-1">
                          <li>Không chuyển sang tab/cửa sổ khác (giới hạn: {test.maxTabSwitches} lần)</li>
                          <li>Không copy/paste nội dung đề bài</li>
                          <li>Bài làm tự động lưu mỗi 30 giây</li>
                          <li>Khi hết giờ bài sẽ tự động nộp</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
