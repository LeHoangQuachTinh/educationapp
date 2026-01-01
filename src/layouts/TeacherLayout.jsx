import React from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { BookOpen, LayoutGrid, MessageCircle, Settings, TrendingUp, UserCheck2, FileCheck, School } from 'lucide-react'

import { useAuth } from '../context/AuthContext'
import { TeacherClassProvider, useTeacherClass } from '../context/TeacherClassContext'

function SideItem({ to, icon: Icon, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          'flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-semibold transition',
          isActive
            ? 'bg-sky-600 text-white'
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

function TeacherSidebar() {
  const { user, logout } = useAuth()
  const { classes, currentClassId, selectClass, loading } = useTeacherClass()

  return (
    <aside className="rounded-3xl border border-slate-100 bg-white p-4 shadow-card">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-extrabold text-slate-900">HappyClass</div>
          <div className="text-xs text-slate-600">Teacher Module</div>
        </div>
        <button
          onClick={logout}
          className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
        >
          Đăng xuất
        </button>
      </div>

      <div className="mt-4 rounded-2xl bg-slate-50 p-3">
        <div className="text-xs text-slate-600">Xin chào</div>
        <div className="mt-1 text-sm font-semibold text-slate-900">{user?.name || 'Giáo viên'}</div>
        <div className="mt-1 text-xs text-slate-600">Vai trò: {user?.role}</div>
      </div>

      <div className="mt-4">
        <div className="text-xs font-semibold text-slate-600">Lớp đang quản lý</div>
        <select
          value={currentClassId}
          onChange={(e) => selectClass(e.target.value)}
          disabled={loading}
          className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100 disabled:opacity-60"
        >
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <div className="mt-2 text-xs text-slate-500">
          {loading ? 'Đang tải danh sách lớp...' : `Đang xem: ${currentClassId}`}
        </div>
      </div>

      <nav className="mt-4 space-y-2">
        <SideItem to="/teacher/dashboard" icon={TrendingUp} label="Tổng quan" />
        <SideItem to="/teacher/class-management" icon={School} label="Quản lý lớp" />
        <SideItem to="/teacher/class-map" icon={LayoutGrid} label="Sơ đồ lớp" />
        <SideItem to="/teacher/seating" icon={LayoutGrid} label="Chỗ ngồi" />
        <SideItem to="/teacher/logbook" icon={BookOpen} label="Sổ đầu bài" />
        <SideItem to="/teacher/attendance" icon={UserCheck2} label="Điểm danh" />
        <SideItem to="/teacher/messages" icon={MessageCircle} label="Tin nhắn" />
        <SideItem to="/teacher/syllabus" icon={BookOpen} label="Giáo án" />
        <SideItem to="/teacher/assignments" icon={BookOpen} label="Giao bài" />
        <SideItem to="/teacher/tests" icon={FileCheck} label="Bài kiểm tra" />
        <SideItem to="/teacher/gradebook" icon={BookOpen} label="Sổ điểm" />
        <SideItem to="/teacher/settings" icon={Settings} label="Cài đặt" />
      </nav>

      <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-white p-3 text-xs text-slate-500">
        Tip: Chọn lớp ở trên để xem đúng danh sách học sinh / bài tập / sơ đồ.
      </div>
    </aside>
  )
}

export default function TeacherLayout() {
  const { user } = useAuth()

  return (
    <TeacherClassProvider teacherId={user?.username || 'gv1'}>
      <div className="min-h-screen bg-slate-50">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 p-4 md:grid-cols-[260px_1fr] md:p-6">
        <TeacherSidebar />

        <main className="min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
    </TeacherClassProvider>
  )
}
