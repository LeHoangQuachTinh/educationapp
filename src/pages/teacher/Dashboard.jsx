import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, LayoutGrid, TrendingUp, UserCheck2 } from 'lucide-react'

import PageHeader from '../../components/common/PageHeader'
import Badge from '../../components/common/Badge'
import SectionCard from '../../components/common/SectionCard'
import SoftButton from '../../components/common/SoftButton'
import { useAuth } from '../../context/AuthContext'
import { useTeacherClass } from '../../context/TeacherClassContext'
import { teacherService } from '../../services/mock/teacherService'
import { assignmentService } from '../../services/mock/assignmentService'

function StatPill({ tone = 'slate', children }) {
  return <Badge tone={tone}>{children}</Badge>
}

function ActionButton({ icon: Icon, label, onClick, tone = 'slate' }) {
  return (
    <SoftButton tone={tone} onClick={onClick}>
      <Icon className="h-4 w-4" />
      {label}
    </SoftButton>
  )
}

function ClassCard({ cls, metrics, onGoMap, onGoAttendance, onGoAssignments, active }) {
  return (
    <SectionCard
      className={active ? 'border-sky-200' : ''}
      title={cls.name}
      subtitle={`Khối ${cls.grade} · ID: ${cls.id}`}
      right={active ? <Badge tone="sky">Đang chọn</Badge> : <Badge tone="slate">Chưa chọn</Badge>}
    >
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-slate-50 p-4">
          <div className="text-xs font-semibold text-slate-600">Sĩ số</div>
          <div className="mt-1 text-2xl font-extrabold text-slate-900">{metrics.studentCount}</div>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <div className="text-xs font-semibold text-slate-600">Điểm TB</div>
          <div className="mt-1 text-2xl font-extrabold text-slate-900">{metrics.avgPoints}</div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <StatPill tone="emerald">Có mặt: {metrics.present}</StatPill>
        <StatPill tone="rose">Vắng: {metrics.absent}</StatPill>
        <StatPill tone="amber">Trễ: {metrics.late}</StatPill>
        <StatPill tone="sky">Bài tập: {metrics.assignments}</StatPill>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <ActionButton icon={LayoutGrid} label="Sơ đồ lớp" onClick={onGoMap} tone="sky" />
        <ActionButton icon={UserCheck2} label="Điểm danh" onClick={onGoAttendance} tone="emerald" />
        <ActionButton icon={BookOpen} label="Giao bài" onClick={onGoAssignments} tone="slate" />
      </div>
    </SectionCard>
  )
}

export default function TeacherDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { classes, currentClassId, selectClass, loading: classLoading } = useTeacherClass()

  const [loading, setLoading] = useState(true)
  const [metricsByClass, setMetricsByClass] = useState({})

  useEffect(() => {
    let mounted = true

    async function load() {
      setLoading(true)

      // Ensure classes are loaded (TeacherClassContext loads in layout)
      const list = classes.length ? classes : await teacherService.getTeacherClasses(user?.username || 'gv1')

      const results = {}

      for (const c of list) {
        const students = await teacherService.getClassList(c.id)
        const assignments = await assignmentService.listAssignments({ classId: c.id })

        const present = students.filter((s) => s.status === 'Present').length
        const absent = students.filter((s) => s.status === 'Absent').length
        const late = students.filter((s) => s.status === 'Late').length

        const avgPoints =
          students.length === 0
            ? 0
            : Math.round(students.reduce((acc, s) => acc + (s.currentPoints || 0), 0) / students.length)

        results[c.id] = {
          studentCount: students.length,
          present,
          absent,
          late,
          avgPoints,
          assignments: assignments.length,
        }
      }

      if (!mounted) return
      setMetricsByClass(results)
      setLoading(false)
    }

    load()

    return () => {
      mounted = false
    }
  }, [classes, user?.username])

  const totals = useMemo(() => {
    const ids = Object.keys(metricsByClass)
    if (!ids.length) return null
    const sum = (key) => ids.reduce((acc, id) => acc + (metricsByClass[id]?.[key] || 0), 0)
    const totalStudents = sum('studentCount')
    const totalAssignments = sum('assignments')
    return {
      totalStudents,
      totalAssignments,
    }
  }, [metricsByClass])

  function goWithClass(classId, path) {
    selectClass(classId)
    navigate(path)
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Tổng quan giáo viên chủ nhiệm"
        subtitle="Quản lý nhiều lớp: sĩ số, điểm danh, điểm thưởng, bài tập."
        right={
          <div className="flex flex-wrap items-center gap-2">
            <StatPill tone="sky">GV: {user?.name || 'Giáo viên'}</StatPill>
            {totals ? <StatPill>HS: {totals.totalStudents}</StatPill> : null}
            {totals ? <StatPill tone="amber">Bài tập: {totals.totalAssignments}</StatPill> : null}
          </div>
        }
      />

      {(classLoading || loading) ? (
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-card">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-sky-600" />
            <div className="text-sm font-semibold">Đang tải dữ liệu tổng quan...</div>
          </div>
          <div className="mt-2 text-sm text-slate-600">Mock API latency 500ms</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {classes.map((c) => (
            <ClassCard
              key={c.id}
              cls={c}
              metrics={metricsByClass[c.id] || { studentCount: 0, present: 0, absent: 0, late: 0, avgPoints: 0, assignments: 0 }}
              active={c.id === currentClassId}
              onGoMap={() => goWithClass(c.id, '/teacher/class-map')}
              onGoAttendance={() => goWithClass(c.id, '/teacher/attendance')}
              onGoAssignments={() => goWithClass(c.id, '/teacher/assignments')}
            />
          ))}
        </div>
      )}

      <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-4 text-xs text-slate-600">
        Tip: Click nút trong từng lớp để tự chuyển lớp + điều hướng sang trang tương ứng.
      </div>
    </div>
  )
}
