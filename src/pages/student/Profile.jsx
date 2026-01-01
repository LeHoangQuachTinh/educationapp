import React from 'react'
import { Heart, Sparkles } from 'lucide-react'

import { useAuth } from '../../context/AuthContext'
import PageHeader from '../../components/common/PageHeader'
import Badge from '../../components/common/Badge'

export default function Profile() {
  const { user } = useAuth()

  return (
    <div className="p-4 md:p-6 pb-24 md:pb-6 space-y-4">
      <PageHeader title="Hồ sơ" subtitle="Thông tin học sinh (demo)." right={<Badge tone="emerald">💰 {user?.points ?? 0} điểm</Badge>} />

      <div className="rounded-3xl bg-gradient-to-r from-sky-600 to-orange-400 p-5 text-white shadow-card">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white/15 text-4xl">🦊</div>
          <div>
            <div className="text-sm text-white/90">Xin chào</div>
            <div className="text-2xl font-extrabold">{user?.name}</div>
            <div className="mt-1 text-sm text-white/90">Lớp 5A · ID: {user?.id}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-600">Sở thích</div>
              <div className="mt-1 text-sm font-extrabold text-slate-900">Vẽ tranh, đọc truyện</div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-pink-100 text-pink-700">
              <Heart className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-600">Mục tiêu tuần</div>
              <div className="mt-1 text-sm font-extrabold text-slate-900">200 điểm/tuần</div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
              <Sparkles className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-4 text-xs text-slate-600">
        Gợi ý: thêm avatar customization + inventory hiển thị ở đây.
      </div>
    </div>
  )
}
