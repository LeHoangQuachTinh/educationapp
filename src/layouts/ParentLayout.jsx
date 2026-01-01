import React from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { BarChart3, Bell, CalendarDays, Home, MessageCircle } from 'lucide-react'

import { useAuth } from '../context/AuthContext'

function Tab({ to, icon: Icon, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        'flex flex-1 flex-col items-center justify-center gap-1 px-2 py-2 text-[11px] font-semibold ' +
        (isActive ? 'text-sky-600' : 'text-slate-500')
      }
      end
    >
      <Icon className="h-5 w-5" />
      {label}
    </NavLink>
  )
}

export default function ParentLayout() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar (compact) */}
      <div className="sticky top-0 z-10 border-b border-slate-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <div>
            <div className="text-sm font-extrabold text-slate-900">HappyClass</div>
            <div className="text-xs text-slate-600">Phụ huynh · {user?.name || 'Tài khoản'}</div>
          </div>
          <button
            onClick={logout}
            className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white"
          >
            Đăng xuất
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-2xl px-4 pb-24 pt-4">
        <Outlet />
      </div>

      {/* Bottom nav (mobile-first) */}
      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-slate-100 bg-white">
        <div className="mx-auto flex max-w-2xl items-center">
          <Tab to="/parent/feed" icon={Home} label="Bảng tin" />
          <Tab to="/parent/chat" icon={MessageCircle} label="Tin nhắn" />
          <Tab to="/parent/report" icon={BarChart3} label="Báo cáo" />
          <Tab to="/parent/timetable" icon={CalendarDays} label="Lịch" />
          <Tab to="/parent/notifications" icon={Bell} label="Thông báo" />
          <Tab to="/parent/grades" icon={BarChart3} label="Điểm" />
        </div>
      </div>
    </div>
  )
}
