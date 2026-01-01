import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, TrendingUp, AlertTriangle, Clock, Users, CheckCircle2 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

import PageHeader from '../../components/common/PageHeader'
import Badge from '../../components/common/Badge'
import { testService } from '../../services/mock/testService'

export default function TestAnalytics() {
  const { testId } = useParams()
  const navigate = useNavigate()

  const [test, setTest] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [testId])

  async function loadData() {
    setLoading(true)
    const [testData, analyticsData] = await Promise.all([
      testService.getTest(testId),
      testService.getTestAnalytics(testId),
    ])
    setTest(testData)
    setAnalytics(analyticsData)
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-card">
          <div className="text-sm font-semibold">Đang tải phân tích...</div>
        </div>
      </div>
    )
  }

  if (!test || !analytics) {
    return (
      <div className="space-y-4">
        <div className="rounded-3xl border border-slate-100 bg-white p-6 text-center shadow-card">
          <div className="text-sm font-semibold text-rose-600">Không tìm thấy dữ liệu</div>
        </div>
      </div>
    )
  }

  const scoreDistribution = [
    { range: '0-2', count: analytics.submitted > 0 ? Math.floor(Math.random() * 3) : 0 },
    { range: '3-4', count: analytics.submitted > 0 ? Math.floor(Math.random() * 5) : 0 },
    { range: '5-6', count: analytics.submitted > 0 ? Math.floor(Math.random() * 8) : 0 },
    { range: '7-8', count: analytics.submitted > 0 ? Math.floor(Math.random() * 10) : 0 },
    { range: '9-10', count: analytics.submitted > 0 ? Math.floor(Math.random() * 6) : 0 },
  ]

  return (
    <div className="space-y-4">
      <PageHeader
        title="Phân tích kết quả"
        subtitle={test.title}
        right={
          <button
            onClick={() => navigate('/teacher/tests')}
            className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-extrabold text-white"
          >
            <ArrowLeft className="h-4 w-4" /> Quay lại
          </button>
        }
      />

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-600">Đã nộp</div>
              <div className="mt-1 text-2xl font-extrabold text-slate-900">{analytics.submitted}</div>
              <div className="mt-1 text-xs text-slate-500">/ {analytics.totalAttempts} bài làm</div>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-600">Điểm TB</div>
              <div className="mt-1 text-2xl font-extrabold text-slate-900">
                {analytics.averageScore.toFixed(1)}
              </div>
              <div className="mt-1 text-xs text-slate-500">/ {test.totalPoints} điểm</div>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
              <TrendingUp className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-600">Thời gian TB</div>
              <div className="mt-1 text-2xl font-extrabold text-slate-900">
                {analytics.averageTime.toFixed(0)}
              </div>
              <div className="mt-1 text-xs text-slate-500">/ {test.duration} phút</div>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
              <Clock className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-600">Cảnh báo</div>
              <div className="mt-1 text-2xl font-extrabold text-slate-900">{analytics.cheatingFlags}</div>
              <div className="mt-1 text-xs text-slate-500">bài nghi ngờ</div>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-700">
              <AlertTriangle className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Score Distribution */}
      <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-card">
        <div className="text-sm font-extrabold text-slate-900">Phân bố điểm số</div>
        <div className="mt-4 h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={scoreDistribution}>
              <XAxis dataKey="range" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip />
              <Bar dataKey="count" fill="#0284c7" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Question Analysis */}
      <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-card">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-extrabold text-slate-900">Phân tích từng câu hỏi</div>
            <div className="mt-1 text-sm text-slate-600">Tỷ lệ trả lời đúng</div>
          </div>
          <Badge tone="sky">{analytics.questionStats.length} câu</Badge>
        </div>

        <div className="mt-4 space-y-3">
          {analytics.questionStats.map((stat, idx) => (
            <div key={stat.questionId} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge tone="slate">Câu {idx + 1}</Badge>
                    <Badge tone={stat.type === 'MULTIPLE_CHOICE' ? 'sky' : 'amber'}>
                      {stat.type === 'MULTIPLE_CHOICE' ? 'Trắc nghiệm' : 'Tự luận'}
                    </Badge>
                  </div>
                  <div className="mt-2 text-sm font-semibold text-slate-900">{stat.question}</div>
                  <div className="mt-2 text-xs text-slate-600">
                    {stat.totalAnswers} học sinh đã trả lời
                  </div>
                </div>

                <div className="text-right">
                  <div
                    className={`text-2xl font-extrabold ${
                      stat.correctRate >= 70
                        ? 'text-emerald-600'
                        : stat.correctRate >= 50
                        ? 'text-amber-600'
                        : 'text-rose-600'
                    }`}
                  >
                    {stat.correctRate.toFixed(0)}%
                  </div>
                  <div className="mt-1 text-xs text-slate-500">đúng</div>
                </div>
              </div>

              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className={`h-2 transition-all ${
                    stat.correctRate >= 70
                      ? 'bg-emerald-600'
                      : stat.correctRate >= 50
                      ? 'bg-amber-600'
                      : 'bg-rose-600'
                  }`}
                  style={{ width: `${stat.correctRate}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Info */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-card">
          <div className="text-sm font-extrabold text-slate-900">Thông tin bài kiểm tra</div>
          <div className="mt-3 space-y-2 text-sm text-slate-700">
            <div className="flex justify-between">
              <span className="text-slate-600">Môn học:</span>
              <span className="font-semibold">{test.subject}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Thời gian:</span>
              <span className="font-semibold">{test.duration} phút</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Số câu hỏi:</span>
              <span className="font-semibold">{test.questions.length} câu</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Tổng điểm:</span>
              <span className="font-semibold">{test.totalPoints} điểm</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Trộn câu hỏi:</span>
              <span className="font-semibold">{test.randomizeQuestions ? 'Có' : 'Không'}</span>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-card">
          <div className="text-sm font-extrabold text-slate-900">Chống gian lận</div>
          <div className="mt-3 space-y-2 text-sm text-slate-700">
            <div className="flex justify-between">
              <span className="text-slate-600">Giới hạn chuyển tab:</span>
              <span className="font-semibold">{test.maxTabSwitches} lần</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Cho phép copy:</span>
              <span className="font-semibold">{test.allowCopyPaste ? 'Có' : 'Không'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Yêu cầu webcam:</span>
              <span className="font-semibold">{test.requireWebcam ? 'Có' : 'Không'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Bài cần chấm tay:</span>
              <span className="font-semibold">{analytics.needsGrading} bài</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
