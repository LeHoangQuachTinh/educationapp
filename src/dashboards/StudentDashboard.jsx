import React, { useMemo, useState } from 'react'
import { Gift, ShoppingBag, Sparkles, Wallet } from 'lucide-react'

import { useApp } from '../context/AppProvider'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'

function ProgressBar({ value, max }) {
  const pct = max === 0 ? 0 : Math.min(100, Math.round((value / max) * 100))
  return (
    <div className="h-2 w-full rounded-full bg-slate-100">
      <div className="h-2 rounded-full bg-emerald-500" style={{ width: pct + '%' }} />
    </div>
  )
}

export function StudentDashboard() {
  const { state, actions, selectors } = useApp()
  const student = selectors.studentById[state.currentStudentId]

  const inventory = state.inventoryByStudent?.[student.id] || []

  const [quizDone, setQuizDone] = useState(false)
  const [wheelResult, setWheelResult] = useState(null)
  const [spinning, setSpinning] = useState(false)

  const dailyQuiz = useMemo(
    () => ({
      q: 'Câu đố nhanh: 12/3 bằng bao nhiêu?',
      options: ['3', '4', '5'],
      answer: '4',
    }),
    [],
  )

  const wheelRewards = useMemo(
    () => [
      { label: '+5 điểm', apply: () => actions.addPoints({ studentId: student.id, delta: 5, category: 'chamChi', reason: 'Vòng quay may mắn (+5)' }) },
      { label: '+2 điểm sáng tạo', apply: () => actions.addPoints({ studentId: student.id, delta: 2, category: 'sangTao', reason: 'Vòng quay may mắn (+2 sáng tạo)' }) },
      { label: 'Sticker ✨', apply: () => actions.buyItem({ studentId: student.id, itemId: 'item_sticker' }) },
      { label: 'Không trúng :( ', apply: () => actions.toast('Vòng quay', 'Lần sau sẽ may mắn hơn nhé!', 'info') },
    ],
    [actions, student.id],
  )

  function spin() {
    if (spinning) return
    setSpinning(true)
    setWheelResult(null)
    window.setTimeout(() => {
      const pick = wheelRewards[Math.floor(Math.random() * wheelRewards.length)]
      setWheelResult(pick.label)
      pick.apply()
      setSpinning(false)
    }, 900 + Math.random() * 700)
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      <Card
        title="Student Dashboard · Trải nghiệm gamified"
        right={
          <div className="flex items-center gap-2">
            <Badge color="emerald">Đang xem: {student.fullName}</Badge>
            <Badge color={student.attendance.lastStatus === 'absent' ? 'rose' : 'emerald'}>
              {student.attendance.lastStatus === 'absent' ? 'Hôm nay: Vắng' : 'Hôm nay: Có mặt'}
            </Badge>
          </div>
        }
      >
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-100 bg-white p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">My Avatar</div>
              <Sparkles className="h-4 w-4 text-amber-600" />
            </div>
            <div className="mt-4 flex items-center justify-center">
              <div
                className={
                  'flex h-24 w-24 items-center justify-center rounded-[2rem] text-5xl ring-4 ' +
                  student.avatar.color +
                  ' ' +
                  student.avatar.ring
                }
              >
                {student.avatar.emoji}
              </div>
            </div>
            <div className="mt-3 text-center text-sm font-semibold">{student.nickname}</div>
            <div className="mt-1 text-center text-xs text-slate-600">
              Mở rộng: tuỳ biến tóc/mũ/trang phục…
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">Happy Wallet</div>
              <Wallet className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="mt-3 text-4xl font-extrabold">{student.points.balance}</div>
            <div className="text-sm text-slate-600">điểm tích luỹ</div>
            <div className="mt-3 space-y-2 text-sm">
              <div>
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>Chăm chỉ</span>
                  <span className="font-semibold">{student.points.chamChi}</span>
                </div>
                <ProgressBar value={student.points.chamChi} max={80} />
              </div>
              <div>
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>Sáng tạo</span>
                  <span className="font-semibold">{student.points.sangTao}</span>
                </div>
                <ProgressBar value={student.points.sangTao} max={80} />
              </div>
              <div>
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>Kỷ luật</span>
                  <span className="font-semibold">{student.points.kyLuat}</span>
                </div>
                <ProgressBar value={student.points.kyLuat} max={80} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">Inventory</div>
              <Gift className="h-4 w-4 text-violet-600" />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {inventory.length ? (
                inventory.map((id) => {
                  const item = state.storeItems.find((i) => i.id === id)
                  return (
                    <div key={id} className="rounded-2xl bg-slate-50 p-3">
                      <div className="text-2xl">{item?.icon || '🎁'}</div>
                      <div className="mt-1 text-xs font-semibold">{item?.name || id}</div>
                    </div>
                  )
                })
              ) : (
                <div className="col-span-2 rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">
                  Chưa có vật phẩm. Hãy vào Store để mua nhé.
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card
          title="Store"
          right={
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-sky-600" />
              <Badge color="slate">Mua bằng điểm</Badge>
            </div>
          }
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {state.storeItems.map((item) => (
              <div key={item.id} className="rounded-2xl border border-slate-100 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-2xl">{item.icon}</div>
                    <div className="mt-1 text-sm font-semibold">{item.name}</div>
                    <div className="mt-1 text-sm text-slate-600">{item.description}</div>
                  </div>
                  <Badge color="amber">{item.cost} điểm</Badge>
                </div>
                <div className="mt-3">
                  <Button
                    variant="outline"
                    onClick={() => actions.buyItem({ studentId: student.id, itemId: item.id })}
                  >
                    Mua
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Entertainment Zone" right={<Badge color="emerald">Mini-games</Badge>}>
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div className="text-sm font-semibold">Daily Quiz</div>
              <div className="mt-1 text-sm text-slate-700">{dailyQuiz.q}</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {dailyQuiz.options.map((opt) => (
                  <Button
                    key={opt}
                    variant="outline"
                    disabled={quizDone}
                    onClick={() => {
                      setQuizDone(true)
                      if (opt === dailyQuiz.answer) {
                        actions.addPoints({ studentId: student.id, delta: 3, category: 'chamChi', reason: 'Quiz đúng (+3)' })
                      } else {
                        actions.toast('Quiz', 'Chưa đúng rồi, thử lại ngày mai nhé!', 'danger')
                      }
                    }}
                  >
                    {opt}
                  </Button>
                ))}
              </div>
              {quizDone ? <div className="mt-2 text-xs text-slate-600">Đã làm quiz hôm nay.</div> : null}
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold">Spin the Wheel</div>
                  <div className="mt-1 text-xs text-slate-600">Ngẫu nhiên phần thưởng (mock)</div>
                </div>
                <Button onClick={spin} disabled={spinning}>
                  {spinning ? 'Đang quay...' : 'Quay'}
                </Button>
              </div>
              {wheelResult ? (
                <div className="mt-3 rounded-2xl bg-white p-3 text-sm">
                  Kết quả: <span className="font-semibold">{wheelResult}</span>
                </div>
              ) : null}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
