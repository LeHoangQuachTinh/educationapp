import React, { useEffect, useMemo, useState } from 'react'
import { Gift, History, Package, Sparkles } from 'lucide-react'

import PageHeader from '../../components/common/PageHeader'
import Badge from '../../components/common/Badge'
import Modal from '../../components/common/Modal'
import SoftButton from '../../components/common/SoftButton'
import SectionCard from '../../components/common/SectionCard'
import { useToast } from '../../components/common/ToastContext'

import { useAuth } from '../../context/AuthContext'
import { rewardService } from '../../services/mock/rewardService'

const ITEMS = [
  { id: 'i1', name: 'Sticker ✨', cost: 30, icon: '✨', desc: 'Dán vở / thưởng nhanh (có thể phát tại lớp).' },
  { id: 'i2', name: 'Mũ cam năng lượng', cost: 80, icon: '🧢', desc: 'Quà vật lý, nhận tại lớp trong tuần.' },
  { id: 'i3', name: 'Thẻ “Miễn BTVN”', cost: 120, icon: '🪪', desc: 'Dùng 1 lần, áp dụng cho 1 môn trong tuần.' },
]

function formatTime(ts) {
  return new Date(ts).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })
}

export default function Rewards() {
  const { user, updateUser } = useAuth()
  const { showToast } = useToast()

  const [wallet, setWallet] = useState({ inventory: [], purchases: [] })
  const [loading, setLoading] = useState(true)

  const [historyOpen, setHistoryOpen] = useState(false)

  async function load() {
    setLoading(true)
    const w = await rewardService.getWallet(user.id)
    setWallet(w)
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id])

  const ownedCountByItem = useMemo(() => {
    const c = {}
    for (const id of wallet.inventory || []) c[id] = (c[id] || 0) + 1
    return c
  }, [wallet.inventory])

  async function buy(it) {
    const balance = user?.points ?? 0
    if (balance < it.cost) {
      showToast({ title: 'Không đủ điểm', message: `Bạn cần thêm ${it.cost - balance} điểm để đổi quà này.`, tone: 'rose' })
      return
    }

    // Update points immediately (optimistic) then persist purchase
    updateUser({ points: balance - it.cost })

    await rewardService.addPurchase({ studentId: user.id, item: it })
    await load()

    showToast({ title: 'Đổi quà thành công', message: `${it.name} (-${it.cost} điểm)`, tone: 'emerald' })
  }

  return (
    <div className="p-4 md:p-6 pb-24 md:pb-6 space-y-4">
      <PageHeader
        title="Đổi quà"
        subtitle="Đổi điểm lấy vật phẩm – có lịch sử & lưu local (prototype)."
        right={
          <div className="flex items-center gap-2">
            <Badge tone="emerald">💰 {user?.points ?? 0} điểm</Badge>
            <button
              onClick={() => setHistoryOpen(true)}
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-3 py-2 text-xs font-extrabold text-white"
            >
              <History className="h-4 w-4" /> Lịch sử
            </button>
          </div>
        }
      />

      <div className="rounded-3xl bg-gradient-to-r from-sky-600 to-orange-400 p-5 text-white shadow-card">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-white/15">
              <Gift className="h-6 w-6" />
            </div>
            <div>
              <div className="text-sm text-white/90">Cửa hàng</div>
              <div className="text-lg font-extrabold">Chọn quà mình thích</div>
              <div className="mt-2 text-xs text-white/90">Tip: đổi quà xong có thể hiển thị trong Hồ sơ (Inventory).</div>
            </div>
          </div>

          <Badge tone="candy" className="bg-white/15 text-white">
            <Package className="mr-1 inline h-4 w-4" /> {loading ? '…' : (wallet.inventory?.length || 0)} vật phẩm
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ITEMS.map((it) => {
          const owned = ownedCountByItem[it.id] || 0
          const canBuy = (user?.points ?? 0) >= it.cost
          return (
            <div key={it.id} className="rounded-3xl border border-slate-100 bg-white p-5 shadow-card">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-3xl">{it.icon}</div>
                  <div className="mt-2 text-sm font-extrabold text-slate-900">{it.name}</div>
                  <div className="mt-2 text-sm text-slate-600">{it.desc}</div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Badge tone="amber">{it.cost} điểm</Badge>
                    {owned ? <Badge tone="emerald">Đã có: {owned}</Badge> : <Badge tone="slate">Chưa sở hữu</Badge>}
                  </div>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                  <Sparkles className="h-5 w-5" />
                </div>
              </div>

              <button
                disabled={!canBuy}
                onClick={() => buy(it)}
                className={
                  'mt-4 w-full rounded-3xl px-4 py-3 text-sm font-extrabold shadow-card transition ' +
                  (canBuy
                    ? 'bg-gradient-to-r from-sky-600 to-orange-500 text-white'
                    : 'bg-slate-100 text-slate-400')
                }
              >
                {canBuy ? 'Đổi quà' : 'Chưa đủ điểm'}
              </button>
            </div>
          )
        })}
      </div>

      <SectionCard
        title="Gợi ý thực tế"
        subtitle="Một số quy tắc đổi quà hay gặp ở lớp học."
        right={<Badge tone="slate">Prototype</Badge>}
      >
        <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
          <li>Quà vật lý: nhận tại lớp, giáo viên xác nhận để tránh nhầm lẫn.</li>
          <li>Quà dạng “phiếu”: có hạn sử dụng (vd: trong tuần) và quy định môn áp dụng.</li>
          <li>Điểm có thể đến từ: nộp bài đúng hạn, phát biểu, hỗ trợ bạn, kỷ luật…</li>
        </ul>
      </SectionCard>

      <Modal
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        title="Lịch sử đổi quà"
        footer={
          <div className="flex items-center justify-end gap-2">
            <SoftButton onClick={() => setHistoryOpen(false)}>Đóng</SoftButton>
          </div>
        }
      >
        {loading ? (
          <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">Đang tải...</div>
        ) : wallet.purchases?.length ? (
          <div className="space-y-2">
            {wallet.purchases.map((p) => (
              <div key={p.id} className="rounded-2xl border border-slate-100 bg-white p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-extrabold text-slate-900">{p.itemName}</div>
                    <div className="mt-1 text-xs text-slate-500">{formatTime(p.ts)}</div>
                  </div>
                  <Badge tone="amber">-{p.cost}</Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl bg-slate-50 p-6 text-center">
            <div className="text-3xl">🎁</div>
            <div className="mt-2 text-sm font-extrabold text-slate-900">Chưa có giao dịch</div>
            <div className="mt-1 text-sm text-slate-600">Hãy đổi 1 món quà để xem lịch sử ở đây.</div>
          </div>
        )}
      </Modal>
    </div>
  )
}
