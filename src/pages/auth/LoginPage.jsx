import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GraduationCap, Lock, User } from 'lucide-react'

import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../components/common/ToastContext'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { showToast } = useToast()

  const [username, setUsername] = useState('hs1')
  const [password, setPassword] = useState('123')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login({ username, password })

      if (user.role === 'STUDENT') {
        navigate('/student/dashboard', { replace: true })
        return
      }

      if (user.role === 'TEACHER') {
        navigate('/teacher/dashboard', { replace: true })
        return
      }

      if (user.role === 'PARENT') {
        navigate('/parent/feed', { replace: true })
        return
      }

      showToast({
        title: 'Chưa hỗ trợ',
        message: 'Role này chưa được hỗ trợ trong prototype hiện tại.',
        tone: 'amber',
      })
    } catch (err) {
      setError(err?.message || 'Đăng nhập thất bại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex min-h-screen max-w-5xl items-center justify-center p-4">
        <div className="grid w-full grid-cols-1 overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-card md:grid-cols-2">
          {/* Left: Branding */}
          <div className="relative hidden bg-gradient-to-br from-sky-600 via-sky-500 to-orange-400 p-8 text-white md:block">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 font-extrabold">
                HC
              </div>
              <div>
                <div className="text-lg font-extrabold">HappyClass</div>
                <div className="text-sm text-white/90">Lớp Học Hạnh Phúc</div>
              </div>
            </div>
            <div className="mt-10 space-y-4">
              <div className="text-2xl font-extrabold leading-tight">
                Đăng nhập để bắt đầu ngày học vui vẻ.
              </div>
              <div className="text-sm text-white/90">
                Prototype Module 1: Authentication & Student Dashboard (mock services).
              </div>
            </div>
            <div className="absolute bottom-6 left-8 right-8 rounded-2xl bg-white/15 p-4 text-sm">
              Tài khoản demo:
              <div className="mt-2 space-y-1">
                <div>
                  <span className="font-semibold">Học sinh:</span> hs1 / 123
                </div>
                <div>
                  <span className="font-semibold">Giáo viên:</span> gv1 / 123
                </div>
                <div>
                  <span className="font-semibold">Phụ huynh:</span> ph1 / 123
                </div>
              </div>
            </div>
          </div>

          {/* Right: Form */}
          <div className="p-6 md:p-8">
            <div className="flex items-center gap-2 text-slate-900">
              <GraduationCap className="h-5 w-5 text-sky-600" />
              <div className="text-lg font-extrabold">Đăng nhập</div>
            </div>
            <div className="mt-1 text-sm text-slate-600">
              Chọn tài khoản học sinh để vào Student Dashboard.
            </div>

            {error ? (
              <div className="mt-4 rounded-2xl border border-rose-100 bg-rose-50 p-3 text-sm text-rose-800">
                {error}
              </div>
            ) : null}

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700">Tài khoản</label>
                <div className="mt-1 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 focus-within:border-sky-400 focus-within:ring-4 focus-within:ring-sky-100">
                  <User className="h-4 w-4 text-slate-400" />
                  <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-transparent text-sm outline-none"
                    placeholder="vd: hs1"
                    autoComplete="username"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Mật khẩu</label>
                <div className="mt-1 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 focus-within:border-sky-400 focus-within:ring-4 focus-within:ring-sky-100">
                  <Lock className="h-4 w-4 text-slate-400" />
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                    className="w-full bg-transparent text-sm outline-none"
                    placeholder="•••"
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <button
                disabled={loading}
                className="inline-flex w-full items-center justify-center rounded-2xl bg-sky-600 px-4 py-3 text-sm font-extrabold text-white transition hover:bg-sky-700 disabled:opacity-50"
              >
                {loading ? 'Đang đăng nhập...' : 'Vào lớp'}
              </button>

              <div className="text-center text-xs text-slate-500">
                Bằng cách đăng nhập, bạn đồng ý với các điều khoản (mock).
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
