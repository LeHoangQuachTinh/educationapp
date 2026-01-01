import React from 'react'
import { GraduationCap, UserRound, UsersRound } from 'lucide-react'
import { useApp } from '../context/AppProvider'
import { Badge } from '../components/ui/Badge'
import { Select } from '../components/ui/Select'

export function RoleSwitcher() {
  const { state, actions, ROLES } = useApp()

  const roleItems = [
    { role: ROLES.teacher, label: 'Giáo viên', icon: GraduationCap, tone: 'bg-sky-600' },
    { role: ROLES.student, label: 'Học sinh', icon: UserRound, tone: 'bg-emerald-600' },
    { role: ROLES.parent, label: 'Phụ huynh', icon: UsersRound, tone: 'bg-violet-600' },
  ]

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white">
          HC
        </div>
        <div>
          <div className="text-sm font-semibold">HappyClass</div>
          <div className="text-xs text-slate-600">Lớp Học Hạnh Phúc · {state.teacher.className}</div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Badge color="blue">Live Context</Badge>

        <div className="hidden md:block">
          <Select
            value={state.currentStudentId}
            onChange={(e) => actions.setCurrentStudent(e.target.value)}
            className="min-w-[220px]"
            aria-label="Chọn học sinh"
          >
            {state.students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.fullName}
              </option>
            ))}
          </Select>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {roleItems.map((it) => {
            const active = state.currentRole === it.role
            const Icon = it.icon
            return (
              <button
                key={it.role}
                onClick={() => actions.setRole(it.role)}
                className={
                  'inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold ring-1 transition ' +
                  (active
                    ? it.tone + ' text-white ring-transparent'
                    : 'bg-white text-slate-700 ring-slate-200 hover:bg-slate-50')
                }
              >
                <Icon className="h-4 w-4" />
                {it.label}
              </button>
            )
          })}
        </div>

        {/* mobile */}
        <div className="md:hidden">
          <Select
            value={state.currentRole}
            onChange={(e) => actions.setRole(e.target.value)}
          >
            {roleItems.map((it) => (
              <option key={it.role} value={it.role}>
                {it.label}
              </option>
            ))}
          </Select>
        </div>
      </div>
    </div>
  )
}
