import React, { useMemo, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  BookOpen,
  LayoutGrid,
  MessageCircle,
  Settings,
  TrendingUp,
  UserCheck2,
  FileCheck,
  School,
  MoreHorizontal,
  ClipboardList,
  NotebookText,
  GraduationCap,
} from 'lucide-react'

import Modal from '../components/common/Modal'

// Mobile bottom tabs reuse pattern (like Student/Parent)
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

function BottomAction({ icon: Icon, label, onClick, active }) {
  return (
    <button
      onClick={onClick}
      className={
        'flex flex-1 flex-col items-center justify-center gap-1 px-2 py-2 text-[11px] font-extrabold ' +
        (active ? 'text-sky-600' : 'text-slate-500')
      }
      type="button"
    >
      <Icon className="h-5 w-5" />
      {label}
    </button>
  )
}

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

function TeacherMobileTopBar() {
  const { user, logout } = useAuth()
  const { classes, currentClassId, selectClass, loading } = useTeacherClass()

  return (
    <div className="sticky top-0 z-10 border-b border-slate-100 bg-white/90 backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <div className="min-w-0">
          <div className="text-sm font-extrabold text-slate-900">HappyClass</div>
          <div className="truncate text-xs text-slate-600">GV · {user?.name || 'Giáo viên'}</div>
        </div>
        <button
          onClick={logout}
          className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white"
        >
          Đăng xuất
        </button>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-3">
        <div className="flex items-center gap-2">
          <div className="text-xs font-semibold text-slate-600">Lớp</div>
          <select
            value={currentClassId}
            onChange={(e) => selectClass(e.target.value)}
            disabled={loading}
            className="flex-1 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100 disabled:opacity-60"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
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
        <SideItem to="/teacher/seating" icon={LayoutGrid} label="Sơ đồ lớp" />
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
  const navigate = useNavigate()
  const [moreOpen, setMoreOpen] = useState(false)

  const moreItems = useMemo(
    () => [
      { to: '/teacher/assignments', icon: ClipboardList, label: 'Giao bài' },
      { to: '/teacher/logbook', icon: NotebookText, label: 'Sổ đầu bài' },
      { to: '/teacher/syllabus', icon: GraduationCap, label: 'Giáo án' },
      { to: '/teacher/tests', icon: FileCheck, label: 'Bài kiểm tra' },
      { to: '/teacher/gradebook', icon: BookOpen, label: 'Sổ điểm' },
      { to: '/teacher/messages', icon: MessageCircle, label: 'Tin nhắn' },
      { to: '/teacher/settings', icon: Settings, label: 'Cài đặt' },
    ],
    [],
  )

  return (
    <TeacherClassProvider teacherId={user?.username || 'gv1'}>
      <div className="min-h-screen bg-slate-50">
        {/* Mobile top bar */}
        <TeacherMobileTopBar />

        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 p-4 pb-24 md:grid-cols-[260px_1fr] md:p-6 md:pb-6">
          <aside className="hidden md:block">
            <TeacherSidebar />
          </aside>

          <main className="min-w-0">
            <Outlet />
          </main>
        </div>

        {/* Mobile bottom tabs (4 items + More) */}
        <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-slate-100 bg-white md:hidden">
          <div className="mx-auto flex max-w-7xl items-center">
            <BottomTab to="/teacher/dashboard" icon={TrendingUp} label="Home" />
            <BottomTab to="/teacher/class-management" icon={School} label="Lớp" />
            <BottomTab to="/teacher/seating" icon={LayoutGrid} label="Sơ đồ" />
            <BottomTab to="/teacher/attendance" icon={UserCheck2} label="Điểm danh" />
            <BottomAction
              icon={MoreHorizontal}
              label="Thêm"
              onClick={() => setMoreOpen(true)}
              active={moreOpen}
            />
          </div>
        </div>

        <Modal
          open={moreOpen}
          onClose={() => setMoreOpen(false)}
          title="Chức năng khác"
          size="md"
          footer={
            <div className="flex items-center justify-end">
              <button
                onClick={() => setMoreOpen(false)}
                className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-extrabold text-white"
              >
                Đóng
              </button>
            </div>
          }
        >
          <div className="grid grid-cols-2 gap-3">
            {moreItems.map((item) => (
              <button
                key={item.to}
                onClick={() => {
                  setMoreOpen(false)
                  navigate(item.to)
                }}
                className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-left hover:bg-slate-100"
              >
                <item.icon className="h-5 w-5 text-sky-600" />
                <div className="text-sm font-semibold text-slate-900">{item.label}</div>
              </button>
            ))}
          </div>
        </Modal>
      </div>
    </TeacherClassProvider>
  )
}
