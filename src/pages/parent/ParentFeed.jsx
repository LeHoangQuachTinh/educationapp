import React, { useEffect, useState } from 'react'
import { RefreshCcw, Star, UserRound } from 'lucide-react'

import { parentService } from '../../services/mock/parentService'

function timeAgo(ts) {
  const diff = Date.now() - ts
  const mins = Math.round(diff / 60000)
  if (mins < 1) return 'Vừa xong'
  if (mins < 60) return `${mins} phút trước`
  const hours = Math.round(mins / 60)
  if (hours < 24) return `${hours} giờ trước`
  const days = Math.round(hours / 24)
  return `${days} ngày trước`
}

function FeedCard({ item }) {
  const isAnnouncement = item.type === 'ANNOUNCEMENT'

  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-card">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-3xl bg-slate-50 text-2xl">
          {isAnnouncement ? (
            item.authorAvatar || '👩‍🏫'
          ) : (
            <Star className="h-5 w-5 text-amber-500" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="truncate text-sm font-extrabold text-slate-900">{item.title}</div>
              <div className="mt-1 text-sm text-slate-700">{item.content}</div>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-2">
              {isAnnouncement ? (
                <span className="inline-flex items-center gap-1">
                  <UserRound className="h-3.5 w-3.5" /> {item.authorName || 'Giáo viên'}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-amber-700">
                  {item.icon ? <span>{item.icon}</span> : null} Hoạt động
                </span>
              )}
            </div>
            <div>{timeAgo(item.createdAt)}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ParentFeed() {
  const [feed, setFeed] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  async function load() {
    setLoading(true)
    const data = await parentService.getParentFeed()
    setFeed(data)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function refresh() {
    setRefreshing(true)
    const data = await parentService.getParentFeed()
    setFeed(data)
    setRefreshing(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-lg font-extrabold text-slate-900">Bảng tin</div>
          <div className="mt-1 text-sm text-slate-600">
            Thông báo từ giáo viên và hoạt động điểm thưởng.
          </div>
        </div>
        <button
          onClick={refresh}
          disabled={refreshing}
          className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
        >
          <RefreshCcw className={"h-4 w-4 " + (refreshing ? 'animate-spin' : '')} />
          Làm mới
        </button>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-card">
          <div className="text-sm font-semibold">Đang tải bảng tin...</div>
          <div className="mt-2 text-sm text-slate-600">Mock API latency 500ms</div>
        </div>
      ) : (
        <div className="space-y-3">
          {feed.map((f) => (
            <FeedCard key={f.id} item={f} />
          ))}
        </div>
      )}
    </div>
  )
}
