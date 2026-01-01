import React, { useEffect, useMemo, useState } from 'react'
import { ArrowRight, Flame, Gift, Sparkles, Trophy } from 'lucide-react'

import { Link } from 'react-router-dom'

import { useAuth } from '../../context/AuthContext'
import { studentService } from '../../services/mock/studentService'

import Badge from '../../components/common/Badge'
import PageHeader from '../../components/common/PageHeader'

function StatChip({ icon: Icon, label, value, tone = 'sky' }) {
  const toneMap = {
    sky: 'bg-sky-100 text-sky-800',
    amber: 'bg-amber-100 text-amber-800',
    emerald: 'bg-emerald-100 text-emerald-800',
    rose: 'bg-rose-100 text-rose-800',
    candy: 'bg-pink-100 text-pink-800',
    lime: 'bg-lime-100 text-lime-800',
  }

  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-card">
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold text-slate-600">{label}</div>
        <div className={`flex h-9 w-9 items-center justify-center rounded-2xl ${toneMap[tone]}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="mt-2 text-lg font-extrabold text-slate-900">{value}</div>
    </div>
  )
}

export default function StudentDashboard() {
  const { user } = useAuth()

  const [info, setInfo] = useState(null)
  const [tasks, setTasks] = useState([])
  const [storePreview, setStorePreview] = useState([])
  const [loading, setLoading] = useState(true)

  const [doneMap, setDoneMap] = useState({})

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      const [i, t, s] = await Promise.all([
        studentService.getStudentInfo(user.id),
        studentService.getDailyTasks(),
        studentService.getStorePreview(),
      ])
      if (!mounted) return
      setInfo(i)
      setTasks(t)
      setStorePreview(s)
      setLoading(false)
    }
    load()
    return () => {
      mounted = false
    }
  }, [user.id])

  const points = useMemo(() => info?.points ?? user?.points ?? 0, [info?.points, user?.points])
  const doneCount = Object.values(doneMap).filter(Boolean).length

  if (loading) {
    return (
      <div className="p-4 md:p-6 pb-24 md:pb-6">
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-card">
          <div className="text-sm font-extrabold">Đang tải Home...</div>
          <div className="mt-2 text-sm text-slate-600">Chờ xíu nha ✨</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 p-4 md:p-6 pb-24 md:pb-6">
      <PageHeader
        title="Home"
        subtitle="Hôm nay mình học gì nhỉ?"
        right={<Badge tone="emerald">💰 {points} điểm</Badge>}
      />

      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-sky-600 to-orange-400 p-5 text-white shadow-card">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/15 blur-2xl" />
        <div className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-white/15 blur-2xl" />

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-white/15 text-3xl">
              {info?.avatar || '🦊'}
            </div>
            <div>
              <div className="text-sm text-white/90">Chào mừng</div>
              <div className="text-2xl font-extrabold">{user.name}</div>
              <div className="mt-1 text-sm text-white/90">{info?.className}</div>
            </div>
          </div>

          <div className="rounded-3xl bg-white/15 p-4">
            <div className="text-xs font-semibold text-white/90">Nhiệm vụ hôm nay</div>
            <div className="mt-1 text-4xl font-extrabold">{doneCount}/{tasks.length}</div>
            <div className="mt-2 h-2 w-full rounded-full bg-white/20">
              <div
                className="h-2 rounded-full bg-white"
                style={{ width: `${tasks.length ? Math.round((doneCount / tasks.length) * 100) : 0}%` }}
              />
            </div>
          </div>
        </div>

        <div className="relative mt-4 flex flex-wrap gap-2">
          <Badge tone="candy" className="bg-white/20 text-white">🔥 Chuỗi: 7 ngày</Badge>
          <Badge tone="lime" className="bg-white/20 text-white">🏅 Hạng: Chăm ngoan</Badge>
          <Badge tone="sky" className="bg-white/20 text-white">🎯 Mục tiêu: 200 điểm</Badge>
        </div>

        <div className="relative mt-4 flex flex-wrap gap-2">
          <Link
            to="/student/review"
            className="inline-flex items-center gap-2 rounded-3xl bg-white px-4 py-3 text-sm font-extrabold text-slate-900 shadow-card"
          >
            <Sparkles className="h-4 w-4 text-amber-600" />
            Ôn tập sau giờ học
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/student/assignments"
            className="inline-flex items-center gap-2 rounded-3xl bg-white/15 px-4 py-3 text-sm font-extrabold text-white"
          >
            Làm bài tập <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatChip icon={Trophy} label="Hạng" value="Học sinh chăm ngoan" tone="amber" />
        <StatChip icon={Flame} label="Chuỗi điểm danh" value="7 ngày" tone="sky" />
        <StatChip icon={Gift} label="Quà sắp mở" value="1 vật phẩm" tone="candy" />
      </div>

      {/* Main */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-card">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-lg font-extrabold">Nhiệm vụ hôm nay</div>
                <div className="mt-1 text-sm text-slate-600">Bấm để đánh dấu hoàn thành.</div>
              </div>
              <Badge tone="sky">{doneCount}/{tasks.length} done</Badge>
            </div>

            <div className="mt-4 space-y-2">
              {tasks.map((t) => {
                const done = !!doneMap[t.id]
                return (
                  <button
                    key={t.id}
                    onClick={() => setDoneMap((prev) => ({ ...prev, [t.id]: !prev[t.id] }))}
                    className={
                      'flex w-full items-start justify-between gap-3 rounded-3xl border p-4 text-left transition hover:-translate-y-[1px] hover:shadow-card ' +
                      (done
                        ? 'border-emerald-100 bg-emerald-50'
                        : 'border-slate-100 bg-white hover:bg-slate-50')
                    }
                  >
                    <div>
                      <div className="text-sm font-extrabold text-slate-900">{t.title}</div>
                      <div className="mt-1 text-xs font-semibold text-slate-600">+{t.xp} XP</div>
                    </div>
                    <Badge tone={done ? 'emerald' : 'slate'}>{done ? 'Done ✅' : 'Chưa'}</Badge>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div>
          <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-extrabold">Cửa hàng đổi quà</div>
                <div className="mt-1 text-sm text-slate-600">Mini preview</div>
              </div>
              <div className="text-2xl">🛍️</div>
            </div>

            <div className="mt-4 space-y-2">
              {storePreview.slice(0, 3).map((it) => (
                <div key={it.id} className="flex items-center justify-between rounded-3xl bg-slate-50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{it.icon}</div>
                    <div>
                      <div className="text-sm font-extrabold">{it.name}</div>
                      <div className="text-xs text-slate-600">{it.cost} điểm</div>
                    </div>
                  </div>
                  <button className="rounded-3xl bg-orange-500 px-4 py-2 text-xs font-extrabold text-white hover:bg-orange-600">
                    Đổi
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-3 rounded-2xl border border-dashed border-slate-200 bg-white p-3 text-xs text-slate-500">
              Gợi ý: vào tab “Đổi quà” để xem đầy đủ.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
