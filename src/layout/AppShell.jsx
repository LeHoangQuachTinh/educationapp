import React from 'react'
import { useApp } from '../context/AppProvider'
import { RoleSwitcher } from './RoleSwitcher'
import { ToastHost } from '../components/ui/ToastHost'
import { TeacherDashboard } from '../dashboards/TeacherDashboard'
import { StudentDashboard } from '../dashboards/StudentDashboard'
import { ParentDashboard } from '../dashboards/ParentDashboard'

function GradientBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-sky-300/30 blur-3xl" />
      <div className="absolute right-0 top-16 h-72 w-72 rounded-full bg-emerald-300/25 blur-3xl" />
      <div className="absolute left-1/3 top-1/2 h-72 w-72 rounded-full bg-violet-300/20 blur-3xl" />
    </div>
  )
}

export function AppShell() {
  const { state, actions, ROLES } = useApp()

  return (
    <div className="relative min-h-screen">
      <GradientBackdrop />

      <ToastHost toasts={state.toasts} onDismiss={actions.dismissToast} />

      <div className="relative mx-auto flex max-w-7xl flex-col gap-4 p-4 md:p-6">
        <header className="rounded-2xl border border-slate-100 bg-white/80 p-4 shadow-card backdrop-blur">
          <RoleSwitcher />
        </header>

        <main className="grid grid-cols-1 gap-4">
          {state.currentRole === ROLES.teacher ? <TeacherDashboard /> : null}
          {state.currentRole === ROLES.student ? <StudentDashboard /> : null}
          {state.currentRole === ROLES.parent ? <ParentDashboard /> : null}
        </main>

        <footer className="pb-6 text-center text-xs text-slate-500">
          Prototype UI · State shared via Context · Nội dung mock tiếng Việt
        </footer>
      </div>
    </div>
  )
}
