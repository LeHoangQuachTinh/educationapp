import React from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import {
  CalendarDays,
  Gamepad2,
  Gift,
  Home,
  ListChecks,
  Sparkles,
  Trophy,
  UserRound,
  FileCheck,
} from 'lucide-react'

import { useAuth } from '../context/AuthContext'
import Badge from '../components/common/Badge'

function SideItem({ to, icon: Icon, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          'flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-extrabold transition',
          isActive
            ? 'bg-gradient-to-r from-sky-600 to-orange-500 text-white'
            : 'text-slate-700 hover:bg-slate-100',
        ].join(' ')
      }
      end
    >
      <Icon className="h-4 w-4" />
      {label}
    </NavLink>
  )
}

function BottomTab({ to, icon: Icon, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        'flex flex-1 flex-col items-center justify-center gap-1 px-2 py-2 text-[11px] font-extrabold ' +
        (isActive ? 'text-sky-600' : 'text-slate-500')
      }
      end
    >
      <Icon className="h-5 w-5" />
      {label}
    </NavLink>
  )
}

function StudentHeader({ user, onLogout }) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-sky-600 to-orange-400 p-4 text-white shadow-card">
      <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/15 blur-2xl" />
      <div className="absolute -left-12 -bottom-12 h-40 w-40 rounded-full bg-white/15 blur-2xl" />

      <div className="relative flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-white/15 text-2xl">
            🦊
          </div>
          <div>
            <div className="text-xs text-white/90">HappyClass</div>
            <div className="text-sm font-extrabold">{user?.name}</div>
            <div className="mt-1 flex items-center gap-2">
              <Badge tone="candy" className="bg-white/20 text-white">
                {user?.points ?? 0} điểm
              </Badge>
              <Badge tone="lime" className="bg-white/20 text-white">
                Level 3
              </Badge>
            </div>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="rounded-2xl bg-white/15 px-3 py-2 text-xs font-extrabold text-white hover:bg-white/20"
        >
          Đăng xuất
        </button>
      </div>

      <div className="relative mt-3 rounded-2xl bg-white/15 p-3">
        <div className="flex items-center justify-between">
          <div className="text-xs font-semibold text-white/90">Thanh tiến độ tuần</div>
          <div className="text-xs font-extrabold text-white">65%</div>
        </div>
        <div className="mt-2 h-2 w-full rounded-full bg-white/20">
          <div className="h-2 w-[65%] rounded-full bg-white" />
        </div>
      </div>
    </div>
  )
}

export default function StudentLayout() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 p-4 md:grid-cols-[280px_1fr] md:p-6">
        <aside className="hidden space-y-4 md:block">
          <StudentHeader user={user} onLogout={logout} />

          <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-card">
            <div className="flex items-center gap-2 text-xs font-extrabold text-slate-900">
              <Sparkles className="h-4 w-4 text-amber-600" />
              Menu học sinh
            </div>
            <nav className="mt-3 space-y-2">
              <SideItem to="/student/dashboard" icon={Home} label="Tổng quan" />
              <SideItem to="/student/assignments" icon={ListChecks} label="Bài tập" />
              <SideItem to="/student/tests" icon={FileCheck} label="Kiểm tra" />
              <SideItem to="/student/rewards" icon={Gift} label="Đổi quà" />
              <SideItem to="/student/review" icon={Gamepad2} label="Ôn tập" />
              <SideItem to="/student/timetable" icon={CalendarDays} label="Lịch học" />
              <SideItem to="/student/leaderboard" icon={Trophy} label="BXH" />
              <SideItem to="/student/profile" icon={UserRound} label="Hồ sơ" />
              <SideItem to="/student/grades" icon={Trophy} label="Bảng điểm" />
            </nav>
          </div>
        </aside>

        <main className="min-w-0">
          {/* Mobile header */}
          <div className="md:hidden">
            <StudentHeader user={user} onLogout={logout} />
          </div>

          <Outlet />
        </main>
      </div>

      {/* Mobile bottom tabs */}
      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-slate-100 bg-white md:hidden">
        <div className="mx-auto flex max-w-7xl items-center">
          <BottomTab to="/student/dashboard" icon={Home} label="Home" />
          <BottomTab to="/student/assignments" icon={ListChecks} label="Bài tập" />
          <BottomTab to="/student/tests" icon={FileCheck} label="Kiểm tra" />
          <BottomTab to="/student/rewards" icon={Gift} label="Đổi quà" />
          <BottomTab to="/student/profile" icon={UserRound} label="Hồ sơ" />
        </div>
      </div>
    </div>
  )
}
