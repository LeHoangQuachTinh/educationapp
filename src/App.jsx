import React from 'react'

// Module 1 routing (Auth + Student) using React Router v6.
import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'

import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastProvider } from './components/common/ToastContext'

import AuthLayout from './layouts/AuthLayout'
import StudentLayout from './layouts/StudentLayout'

import LoginPage from './pages/auth/LoginPage'
import StudentDashboard from './pages/student/StudentDashboard'
import Assignments from './pages/student/Assignments'
import Rewards from './pages/student/Rewards'
import Timetable from './pages/student/Timetable'
import Profile from './pages/student/Profile'
import Leaderboard from './pages/student/Leaderboard'
import ReviewGames from './pages/student/ReviewGames'
import StudentGrades from './pages/student/Grades'

import TeacherLayout from './layouts/TeacherLayout'
import TeacherDashboard from './pages/teacher/Dashboard'
import ClassSeating from './pages/teacher/ClassSeating'
import Logbook from './pages/teacher/Logbook'
import TeacherSettings from './pages/teacher/Settings'
import Attendance from './pages/teacher/Attendance'
import Messages from './pages/teacher/Messages'
import Syllabus from './pages/teacher/Syllabus'
import TeacherAssignments from './pages/teacher/Assignments'
import Gradebook from './pages/teacher/Gradebook'
import TeacherTests from './pages/teacher/Tests'
import TestAnalytics from './pages/teacher/TestAnalytics'
import TestSubmissions from './pages/teacher/TestSubmissions'
import ClassManagement from './pages/teacher/ClassManagement'
import ClassDetail from './pages/teacher/ClassDetail'

import StudentTests from './pages/student/Tests'
import TakeTest from './pages/student/TakeTest'

import ParentLayout from './layouts/ParentLayout'
import ParentFeed from './pages/parent/ParentFeed'
import ParentChat from './pages/parent/ParentChat'
import StudentReport from './pages/parent/StudentReport'
import ParentTimetable from './pages/parent/Timetable'
import Notifications from './pages/parent/Notifications'
import ParentGrades from './pages/parent/Grades'

function RequireAuth({ role, onUnauthorized }) {
  const { isAuthenticated, loading, user } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-md rounded-2xl bg-white p-6 shadow-card">
          <div className="text-sm font-semibold">Đang kiểm tra phiên đăng nhập...</div>
          <div className="mt-2 text-sm text-slate-600">Vui lòng chờ</div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />

  if (role && user?.role !== role) {
    return onUnauthorized ? onUnauthorized(user) : <Navigate to="/login" replace />
  }

  return <Outlet />
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/" element={<Navigate to="/login" replace />} />
            </Route>

            {/* FIXED STUDENT SECTION BELOW */}
            <Route 
              element={
                <RequireAuth 
                  role="STUDENT" 
                  onUnauthorized={() => <Navigate to="/teacher/dashboard" replace />} 
                />
              }
            >
              <Route element={<StudentLayout />}>
                <Route path="/student/dashboard" element={<StudentDashboard />} />
                <Route path="/student/assignments" element={<Assignments />} />
                <Route path="/student/rewards" element={<Rewards />} />
                <Route path="/student/timetable" element={<Timetable />} />
                <Route path="/student/leaderboard" element={<Leaderboard />} />
                <Route path="/student/profile" element={<Profile />} />
                <Route path="/student/review" element={<ReviewGames />} />
                <Route path="/student/grades" element={<StudentGrades />} />
                <Route path="/student/tests" element={<StudentTests />} />
                <Route path="/student" element={<Navigate to="/student/dashboard" replace />} />
              </Route>
              <Route path="/student/take-test/:testId" element={<TakeTest />} />
            </Route>

            <Route element={<RequireAuth role="TEACHER" onUnauthorized={() => <Navigate to="/student/dashboard" replace />} />}>
              <Route element={<TeacherLayout />}>
                <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
                <Route path="/teacher/seating" element={<ClassSeating />} />
                <Route path="/teacher/logbook" element={<Logbook />} />
                <Route path="/teacher/attendance" element={<Attendance />} />
                <Route path="/teacher/messages" element={<Messages />} />
                <Route path="/teacher/syllabus" element={<Syllabus />} />
                <Route path="/teacher/assignments" element={<TeacherAssignments />} />
                <Route path="/teacher/gradebook" element={<Gradebook />} />
                <Route path="/teacher/tests" element={<TeacherTests />} />
                <Route path="/teacher/test-analytics/:testId" element={<TestAnalytics />} />
                <Route path="/teacher/test-submissions/:testId" element={<TestSubmissions />} />
                <Route path="/teacher/class-management" element={<ClassManagement />} />
                <Route path="/teacher/class/:classId" element={<ClassDetail />} />
                <Route path="/teacher/settings" element={<TeacherSettings />} />
                <Route path="/teacher" element={<Navigate to="/teacher/dashboard" replace />} />
              </Route>
            </Route>

            <Route element={<RequireAuth role="PARENT" onUnauthorized={() => <Navigate to="/student/dashboard" replace />} />}>
              <Route element={<ParentLayout />}>
                <Route path="/parent/feed" element={<ParentFeed />} />
                <Route path="/parent/chat" element={<ParentChat />} />
                <Route path="/parent/report" element={<StudentReport />} />
                <Route path="/parent/timetable" element={<ParentTimetable />} />
                <Route path="/parent/notifications" element={<Notifications />} />
                <Route path="/parent/grades" element={<ParentGrades />} />
                <Route path="/parent" element={<Navigate to="/parent/feed" replace />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  )
}