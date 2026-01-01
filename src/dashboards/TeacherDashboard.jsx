import React from 'react'
import { BarChart3, GraduationCap, Sparkles } from 'lucide-react'

import { useApp } from '../context/AppProvider'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { SeatingChart } from './teacher/SeatingChart'
import { ScheduleLogbook } from './teacher/ScheduleLogbook'
import { SyllabusManager } from './teacher/SyllabusManager'

export function TeacherDashboard() {
  const { state } = useApp()

  return (
    <div className="grid grid-cols-1 gap-4">
      <Card
        title="Teacher Dashboard · Command Center"
        right={
          <div className="flex items-center gap-2">
            <Badge color="blue">{state.teacher.className}</Badge>
            <Badge color="emerald">Sổ đầu bài</Badge>
            <Badge color="amber">Gamification</Badge>
          </div>
        }
      >
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-sky-700" />
              <div className="text-sm font-semibold">Điều hành lớp</div>
            </div>
            <div className="mt-1 text-sm text-slate-600">
              Sơ đồ lớp, cộng/trừ điểm, điểm danh, hồ sơ học sinh.
            </div>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-emerald-700" />
              <div className="text-sm font-semibold">Theo dõi tiến độ</div>
            </div>
            <div className="mt-1 text-sm text-slate-600">
              Thời khoá biểu tuần auto-sync giáo án, lưu sổ đầu bài theo tiết.
            </div>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-700" />
              <div className="text-sm font-semibold">AI hỗ trợ</div>
            </div>
            <div className="mt-1 text-sm text-slate-600">
              Mô phỏng tạo slide theo bài học (loader + preview).
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <SeatingChart />
        <ScheduleLogbook />
      </div>

      <SyllabusManager />
    </div>
  )
}
