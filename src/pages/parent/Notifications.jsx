import React, { useEffect, useMemo, useState } from 'react'
import { CheckCheck, Filter, MailOpen, PlusCircle, SendHorizonal } from 'lucide-react'

import PageHeader from '../../components/common/PageHeader'
import Badge from '../../components/common/Badge'
import Modal from '../../components/common/Modal'
import SoftButton from '../../components/common/SoftButton'
import Input from '../../components/common/Input'

import { useAuth } from '../../context/AuthContext'
import { leaveRequestService } from '../../services/mock/leaveRequestService'
import { notificationService } from '../../services/mock/notificationService'

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

export default function Notifications() {
  const { user } = useAuth()
  const studentId = user?.childId

  const [loading, setLoading] = useState(true)
  const [data, setData] = useState({ list: [], readById: {} })
  const [filter, setFilter] = useState('all') // all | unread

  const [reqOpen, setReqOpen] = useState(false)
  const [reqType, setReqType] = useState('ABSENCE')
  const [reqDate, setReqDate] = useState(leaveRequestService.getTodayKey())
  const [reqReason, setReqReason] = useState('')
  const [pickupBy, setPickupBy] = useState('')
  const [pickupPhone, setPickupPhone] = useState('')
  const [sending, setSending] = useState(false)

  const [myRequests, setMyRequests] = useState([])

  async function load() {
    setLoading(true)
    const [d, reqs] = await Promise.all([
      notificationService.list({ studentId }),
      studentId ? leaveRequestService.listByStudent({ studentId }) : Promise.resolve([]),
    ])
    setData(d)
    setMyRequests(reqs)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const unreadCount = useMemo(() => {
    return data.list.filter((n) => !data.readById[n.id]).length
  }, [data.list, data.readById])

  const visible = useMemo(() => {
    if (filter === 'unread') return data.list.filter((n) => !data.readById[n.id])
    return data.list
  }, [data.list, data.readById, filter])

  async function markRead(id) {
    await notificationService.markRead({ studentId, id })
    await load()
  }

  async function markAll() {
    await notificationService.markAllRead({ studentId })
    await load()
  }

  async function sendRequest() {
    if (!studentId) return
    if (!reqDate) return

    if (reqType === 'ABSENCE' && !reqReason.trim()) return
    if (reqType === 'PICKUP_CHANGE' && (!pickupBy.trim() || !pickupPhone.trim())) return

    setSending(true)
    try {
      await leaveRequestService.create({
        type: reqType,
        studentId,
        dateKey: reqDate,
        reason: reqReason.trim(),
        pickupBy: pickupBy.trim(),
        pickupPhone: pickupPhone.trim(),
      })

      // Optional: add a local notification entry so parent sees it in feed immediately
      await notificationService.add({
        studentId,
        source: 'SYSTEM',
        text:
          reqType === 'ABSENCE'
            ? `Bạn đã gửi xin nghỉ ngày ${reqDate}.`
            : `Bạn đã gửi yêu cầu thay đổi đón (ngày ${reqDate}).`,
      })

      setReqOpen(false)
      setReqReason('')
      setPickupBy('')
      setPickupPhone('')
      await load()
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Thông báo"
        subtitle="Có đọc/chưa đọc + gửi xin nghỉ/đón muộn (prototype)."
        right={
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={unreadCount ? 'rose' : 'emerald'}>
              {unreadCount ? `Chưa đọc: ${unreadCount}` : 'Đã đọc hết'}
            </Badge>
            <button
              onClick={() => setReqOpen(true)}
              className="inline-flex items-center gap-2 rounded-2xl bg-sky-600 px-3 py-2 text-xs font-extrabold text-white"
            >
              <PlusCircle className="h-4 w-4" /> Xin nghỉ / Đón
            </button>
            <button
              onClick={markAll}
              disabled={loading || unreadCount === 0}
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-3 py-2 text-xs font-extrabold text-white disabled:opacity-50"
            >
              <CheckCheck className="h-4 w-4" /> Đọc tất cả
            </button>
          </div>
        }
      />

      <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-card">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-extrabold text-slate-900">Yêu cầu của tôi</div>
            <div className="mt-1 text-xs text-slate-600">Xin nghỉ / thay đổi đón – chờ giáo viên duyệt.</div>
          </div>
          <Badge tone="slate">{myRequests.length}</Badge>
        </div>

        <div className="mt-3 space-y-2">
          {myRequests.slice(0, 4).map((r) => (
            <div key={r.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-sm font-semibold text-slate-900">
                  {r.type === 'ABSENCE' ? 'Xin nghỉ' : 'Thay đổi đón'} · {r.dateKey}
                </div>
                <Badge
                  tone={r.status === 'APPROVED' ? 'emerald' : r.status === 'REJECTED' ? 'rose' : 'amber'}
                >
                  {r.status}
                </Badge>
              </div>
              <div className="mt-2 text-sm text-slate-700">
                {r.type === 'ABSENCE'
                  ? r.reason
                  : `Người đón: ${r.pickupBy} (${r.pickupPhone})`}
              </div>
              {r.teacherNote ? <div className="mt-2 text-xs text-slate-600">Ghi chú GV: {r.teacherNote}</div> : null}
            </div>
          ))}
          {!myRequests.length ? (
            <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">Chưa có yêu cầu.</div>
          ) : null}
        </div>
      </div>

      <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-extrabold text-slate-900">
            <Filter className="h-4 w-4 text-slate-600" /> Lọc
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilter('all')}
              className={
                'rounded-2xl px-3 py-2 text-xs font-extrabold ' +
                (filter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700')
              }
            >
              Tất cả
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={
                'rounded-2xl px-3 py-2 text-xs font-extrabold ' +
                (filter === 'unread' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700')
              }
            >
              Chưa đọc
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-card">Đang tải...</div>
      ) : (
        <div className="space-y-3">
          {visible.map((n) => {
            const read = !!data.readById[n.id]
            return (
              <button
                key={n.id}
                onClick={() => (read ? null : markRead(n.id))}
                className={
                  'w-full rounded-3xl border p-4 text-left shadow-card transition focus:outline-none focus:ring-4 focus:ring-sky-100 ' +
                  (read ? 'border-slate-100 bg-white' : 'border-sky-100 bg-sky-50')
                }
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{n.text}</div>
                    <div className="mt-2 text-xs text-slate-500">{timeAgo(n.createdAt)}</div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge tone={n.source === 'TEACHER' ? 'sky' : 'slate'}>{n.source === 'TEACHER' ? 'Giáo viên' : 'Hệ thống'}</Badge>
                    {read ? (
                      <Badge tone="emerald">Đã đọc</Badge>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-extrabold text-sky-700">
                        <MailOpen className="h-4 w-4" /> Chạm để đọc
                      </span>
                    )}
                  </div>
                </div>
              </button>
            )
          })}

          {!visible.length ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-600">
              Không có thông báo phù hợp.
            </div>
          ) : null}
        </div>
      )}

      <Modal
        open={reqOpen}
        onClose={() => setReqOpen(false)}
        title="Xin nghỉ / Thay đổi đón"
        footer={
          <div className="flex items-center justify-end gap-2">
            <SoftButton onClick={() => setReqOpen(false)} variant="secondary">Hủy</SoftButton>
            <SoftButton onClick={sendRequest} disabled={sending}>
              <SendHorizonal className="h-4 w-4" /> Gửi yêu cầu
            </SoftButton>
          </div>
        }
      >
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            <div>
              <div className="text-xs font-semibold text-slate-600">Loại yêu cầu</div>
              <select
                value={reqType}
                onChange={(e) => setReqType(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
              >
                <option value="ABSENCE">Xin nghỉ học</option>
                <option value="PICKUP_CHANGE">Thay đổi người đón / đón muộn</option>
              </select>
            </div>

            <div>
              <div className="text-xs font-semibold text-slate-600">Ngày</div>
              <input
                type="date"
                value={reqDate}
                onChange={(e) => setReqDate(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
              />
            </div>
          </div>

          {reqType === 'ABSENCE' ? (
            <div>
              <div className="text-xs font-semibold text-slate-600">Lý do</div>
              <textarea
                value={reqReason}
                onChange={(e) => setReqReason(e.target.value)}
                placeholder="Ví dụ: bé sốt, xin nghỉ 1 ngày..."
                className="mt-1 min-h-[90px] w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
              />
              <div className="mt-1 text-xs text-slate-500">Gợi ý: ghi rõ triệu chứng/thời gian dự kiến quay lại.</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              <div>
                <div className="text-xs font-semibold text-slate-600">Người đón</div>
                <Input value={pickupBy} onChange={(e) => setPickupBy(e.target.value)} placeholder="Tên người đón" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-600">SĐT</div>
                <Input value={pickupPhone} onChange={(e) => setPickupPhone(e.target.value)} placeholder="090..." />
              </div>
            </div>
          )}

          <div className="rounded-2xl bg-slate-50 p-3 text-xs text-slate-600">
            Lưu ý: Đây là demo. Giáo viên sẽ duyệt/từ chối trong màn hình Điểm danh.
          </div>
        </div>
      </Modal>
    </div>
  )
}
