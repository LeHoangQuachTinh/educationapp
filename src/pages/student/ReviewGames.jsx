import React, { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  BookOpenCheck,
  CheckCircle2,
  ChevronRight,
  Gamepad2,
  Layers3,
  Sparkles,
  Timer,
  Zap,
} from 'lucide-react'

import PageHeader from '../../components/common/PageHeader'
import Badge from '../../components/common/Badge'
import Button from '../../components/common/Button'
import SectionCard from '../../components/common/SectionCard'

import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../components/common/ToastContext'
import { reviewGameService } from '../../services/mock/reviewGameService'
import { dailyLeaderboardService } from '../../services/mock/dailyLeaderboardService'

function ProgressBar({ value, max }) {
  const pct = max <= 0 ? 0 : Math.round((value / max) * 100)
  return (
    <div className="h-2 w-full rounded-full bg-slate-100">
      <div className="h-2 rounded-full bg-gradient-to-r from-sky-600 to-orange-500" style={{ width: pct + '%' }} />
    </div>
  )
}

function Chip({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={
        'rounded-full px-3 py-1 text-xs font-extrabold transition ' +
        (active
          ? 'bg-slate-900 text-white'
          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50')
      }
    >
      {children}
    </button>
  )
}

function ModeCard({ icon: Icon, title, desc, reward, done, onClick }) {
  return (
    <button
      onClick={onClick}
      className={
        'group w-full rounded-3xl border p-5 text-left shadow-card transition hover:-translate-y-[1px] hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-sky-100 ' +
        (done ? 'border-emerald-100 bg-emerald-50' : 'border-slate-100 bg-white')
      }
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div
            className={
              'flex h-11 w-11 items-center justify-center rounded-2xl text-white transition ' +
              (done ? 'bg-emerald-600' : 'bg-slate-900 group-hover:bg-sky-700')
            }
          >
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-extrabold text-slate-900">{title}</div>
            <div className="mt-1 text-sm text-slate-600">{desc}</div>
            <div className="mt-3 flex items-center gap-2">
              {done ? <Badge tone="emerald">Đã hoàn thành</Badge> : <Badge tone="amber">Chưa chơi</Badge>}
              <Badge tone="candy">+{reward} điểm</Badge>
            </div>
          </div>
        </div>

        <ChevronRight className="mt-1 h-5 w-5 text-slate-300 transition group-hover:text-slate-500" />
      </div>
    </button>
  )
}

function BackButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-3 py-2 text-xs font-extrabold text-white"
    >
      <ArrowLeft className="h-4 w-4" /> Quay lại
    </button>
  )
}

export default function ReviewGames() {
  const { user, updateUser } = useAuth()
  const { showToast } = useToast()

  const classId = '5A'
  const studentId = user?.id

  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)

  const [subjectKey, setSubjectKey] = useState('all')

  // 'hub' | 'quiz' | 'flashcards' | 'tf' | 'mini' | 'leaderboard'
  const [screen, setScreen] = useState('hub')

  // Quiz
  const [quizIndex, setQuizIndex] = useState(0)
  const [quizCorrect, setQuizCorrect] = useState(0)
  const [quizDone, setQuizDone] = useState(false)
  const [quizPick, setQuizPick] = useState(null)

  // Flashcards (carousel)
  const [cardIndex, setCardIndex] = useState(0)
  const [cardFlip, setCardFlip] = useState(false)
  const [cardsDone, setCardsDone] = useState(false)

  // True/False
  const [tfIndex, setTfIndex] = useState(0)
  const [tfCorrect, setTfCorrect] = useState(0)
  const [tfDone, setTfDone] = useState(false)
  const [tfPick, setTfPick] = useState(null)

  // Mini game
  const [miniIndex, setMiniIndex] = useState(0)
  const [miniScore, setMiniScore] = useState(0)
  const [miniDone, setMiniDone] = useState(false)
  const [miniPick, setMiniPick] = useState(null)

  // Pairs mini-game state
  const [pairSelectedIds, setPairSelectedIds] = useState([])
  const [pairRevealedIds, setPairRevealedIds] = useState([])
  const [pairMatchedIds, setPairMatchedIds] = useState([])

  // Leaderboard
  const [board, setBoard] = useState([])

  // Timer + streak (for quiz/tf/mini)
  const [timeLeft, setTimeLeft] = useState(45)
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)

  const reward = useMemo(
    () => ({
      quiz: 6,
      flashcards: 3,
      tf: 4,
      mini: 5,
    }),
    [],
  )

  async function load() {
    setLoading(true)
    const d = await reviewGameService.getDailyReview({ classId, studentId })

    await dailyLeaderboardService.seedIfEmpty({ classId, dateKey: d.dateKey })
    const list = await dailyLeaderboardService.list({ classId, dateKey: d.dateKey })

    setData(d)
    setBoard(list)
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // countdown timer for fast modes
  useEffect(() => {
    const timed = screen === 'quiz' || screen === 'tf' || screen === 'mini'
    if (!timed) return

    const done =
      (screen === 'quiz' && quizDone) ||
      (screen === 'tf' && tfDone) ||
      (screen === 'mini' && miniDone)

    if (done) return

    const id = window.setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          // time up => end the game
          if (screen === 'quiz') setQuizDone(true)
          if (screen === 'tf') setTfDone(true)
          if (screen === 'mini') setMiniDone(true)
          return 0
        }
        return t - 1
      })
    }, 1000)

    return () => window.clearInterval(id)
  }, [screen, quizDone, tfDone, miniDone])

  function resetGame(game) {
    if (game === 'quiz') {
      setQuizIndex(0)
      setQuizCorrect(0)
      setQuizDone(false)
      setQuizPick(null)
      setTimeLeft(45)
      setStreak(0)
      setBestStreak(0)
    }
    if (game === 'flashcards') {
      setCardIndex(0)
      setCardFlip(false)
      setCardsDone(false)
    }
    if (game === 'tf') {
      setTfIndex(0)
      setTfCorrect(0)
      setTfDone(false)
      setTfPick(null)
      setTimeLeft(45)
      setStreak(0)
      setBestStreak(0)
    }
    if (game === 'mini') {
      setMiniIndex(0)
      setMiniScore(0)
      setMiniDone(false)
      setMiniPick(null)
      setPairSelectedIds([])
      setPairRevealedIds([])
      setPairMatchedIds([])
      setTimeLeft(45)
      setStreak(0)
      setBestStreak(0)
    }
  }

  const pack = useMemo(() => {
    if (!data?.pack) return null
    if (subjectKey === 'all') return data.pack
    return data.pack.bySubject?.[subjectKey] || data.pack
  }, [data?.pack, subjectKey])

  const completed = data?.progress?.completed || {}

  const modeKeys = useMemo(
    () => ({
      quiz: `quiz_${subjectKey}`,
      flashcards: `flash_${subjectKey}`,
      tf: `tf_${subjectKey}`,
      mini: `mini_${subjectKey}`,
    }),
    [subjectKey],
  )

  const modeDone = useMemo(
    () => ({
      quiz: !!completed[modeKeys.quiz],
      flashcards: !!completed[modeKeys.flashcards],
      tf: !!completed[modeKeys.tf],
      mini: !!completed[modeKeys.mini],
    }),
    [completed, modeKeys],
  )

  async function grantOnce({ mode, points, score }) {
    const mk = modeKeys[mode]

    if (completed[mk]) {
      showToast({
        title: 'Hôm nay bạn đã nhận thưởng rồi',
        message: 'Bạn vẫn có thể chơi lại để luyện tập, nhưng không cộng điểm thêm.',
        tone: 'amber',
      })
      return
    }

    updateUser({ points: (user.points || 0) + points })
    await reviewGameService.completeMode({ studentId, dateKey: data.dateKey, modeKey: mk, score, earned: points })

    await dailyLeaderboardService.upsertScore({
      classId,
      dateKey: data.dateKey,
      studentId,
      name: user?.name || studentId,
      pointsEarned: points,
      score,
    })

    showToast({
      title: 'Nhận thưởng ✨',
      message: `+${points} điểm (Daily Review)`,
      tone: 'candy',
    })

    await load()
  }

  if (loading || !data || !pack) {
    return (
      <div className="p-4 md:p-6">
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-card">
          <div className="text-sm font-semibold">Đang tạo game ôn tập theo bài học hôm nay...</div>
          <div className="mt-2 text-sm text-slate-600">Game được sinh từ thời khóa biểu + giáo án (mock).</div>
        </div>
      </div>
    )
  }

  const subjectOptions = [
    { key: 'all', label: 'Tất cả' },
    ...Object.values(data.pack.bySubject || {}).map((s) => ({ key: s.subjectId, label: s.subjectName })),
  ]

  const quiz = pack.quiz
  const q = quiz.questions[quizIndex]

  const tfList = pack.tf
  const tf = tfList[tfIndex]

  const cards = pack.flashcards
  const card = cards[cardIndex]

  const todayPct = Math.round(
    (((modeDone.quiz ? 1 : 0) + (modeDone.flashcards ? 1 : 0) + (modeDone.tf ? 1 : 0) + (modeDone.mini ? 1 : 0)) / 4) * 100,
  )

  return (
    <div className="p-4 md:p-6 space-y-4">
      <PageHeader
        title="Trò chơi ôn bài hôm nay"
        subtitle="Nội dung bám theo tiết học trong ngày. Chơi xong nhận thưởng (mỗi mode 1 lần/ngày)."
        right={<Badge tone="emerald">💰 {user.points ?? 0} điểm</Badge>}
      />

      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-sky-600 via-sky-500 to-orange-400 p-5 text-white shadow-card">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/15 blur-2xl" />
        <div className="pointer-events-none absolute -left-16 -bottom-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-white/15">
              <Gamepad2 className="h-6 w-6" />
            </div>
            <div>
              <div className="text-sm text-white/90">{data.dateLabel} · Daily Review</div>
              <div className="text-lg font-extrabold">Hôm nay mình ôn gì?</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {pack.topics.map((t) => (
                  <span key={t} className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="min-w-[220px] rounded-2xl bg-white/15 p-3">
            <div className="flex items-center justify-between text-xs font-semibold text-white/90">
              <span className="inline-flex items-center gap-2">
                <Zap className="h-4 w-4" /> Tiến độ hôm nay
              </span>
              <span className="font-extrabold">{todayPct}%</span>
            </div>
            <div className="mt-2">
              <div className="h-2 w-full rounded-full bg-white/20">
                <div className="h-2 rounded-full bg-white" style={{ width: todayPct + '%' }} />
              </div>
            </div>
            <div className="mt-2 text-[11px] text-white/85">Hoàn thành 4 mode (có Mini Game) để tối ưu điểm thưởng.</div>
          </div>
        </div>
      </div>

      <SectionCard
        title="Chọn môn"
        subtitle="Ôn theo từng môn hoặc gộp tất cả bài trong ngày."
        right={
          <div className="flex items-center gap-2">
            <Badge tone="slate">{data.dateKey}</Badge>
            <Button variant="outline" onClick={() => setScreen('leaderboard')}>
              BXH
            </Button>
          </div>
        }
      >
        <div className="flex flex-wrap gap-2">
          {subjectOptions.map((s) => (
            <Chip
              key={s.key}
              active={subjectKey === s.key}
              onClick={() => {
                setSubjectKey(s.key)
                setScreen('hub')
              }}
            >
              {s.label}
            </Chip>
          ))}
        </div>
      </SectionCard>

      {/* HUB */}
      {screen === 'hub' ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
          <ModeCard
            icon={Sparkles}
            title={quiz.title}
            desc="Chọn đáp án – nhanh, vui, đúng bài hôm nay."
            reward={reward.quiz}
            done={modeDone.quiz}
            onClick={() => {
              resetGame('quiz')
              setScreen('quiz')
            }}
          />
          <ModeCard
            icon={Layers3}
            title="Flashcards"
            desc="Lật thẻ – nhớ mục tiêu & nội dung chính."
            reward={reward.flashcards}
            done={modeDone.flashcards}
            onClick={() => {
              resetGame('flashcards')
              setScreen('flashcards')
            }}
          />
          <ModeCard
            icon={BookOpenCheck}
            title="Đúng / Sai"
            desc="Phản xạ nhanh – củng cố ý chính."
            reward={reward.tf}
            done={modeDone.tf}
            onClick={() => {
              resetGame('tf')
              setScreen('tf')
            }}
          />

          <ModeCard
            icon={Zap}
            title={pack.mini?.title || 'Mini Game'}
            desc={pack.mini ? 'Trò chơi theo môn học (hôm nay).' : 'Chưa có mini game cho môn này.'}
            reward={reward.mini}
            done={modeDone.mini}
            onClick={() => {
              if (!pack.mini) {
                showToast({ title: 'Chưa có mini game', message: 'Hãy thử chọn môn khác hoặc chọn “Tất cả”.', tone: 'amber' })
                return
              }
              resetGame('mini')
              setScreen('mini')
            }}
          />
        </div>
      ) : null}

      {/* QUIZ */}
      {screen === 'quiz' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <BackButton onClick={() => setScreen('hub')} />
            <div className="flex items-center gap-2">
              <Badge tone="slate"><Timer className="mr-1 inline h-4 w-4" /> {timeLeft}s</Badge>
              <Badge tone="violet">Streak: {streak}</Badge>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-card">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="text-sm font-extrabold text-slate-900">{quiz.title}</div>
                <div className="mt-1 text-sm text-slate-600">
                  Câu {quizIndex + 1}/{quiz.questions.length}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone="emerald">Đúng: {quizCorrect}</Badge>
                {modeDone.quiz ? <Badge tone="amber">Đã nhận thưởng</Badge> : <Badge tone="candy">+{reward.quiz}</Badge>}
              </div>
            </div>

            <div className="mt-4">
              <ProgressBar value={quizIndex} max={quiz.questions.length} />
            </div>

            {quizDone ? (
              <div className="mt-4 rounded-2xl bg-emerald-50 p-4">
                <div className="flex items-center gap-2 text-emerald-800">
                  <CheckCircle2 className="h-5 w-5" />
                  <div className="text-sm font-extrabold">Bạn đã hoàn thành Quiz!</div>
                </div>
                <div className="mt-2 text-sm text-emerald-900">
                  Đúng {quizCorrect}/{quiz.questions.length} câu.
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <Button
                    onClick={() => grantOnce({ mode: 'quiz', points: reward.quiz, score: quizCorrect + bestStreak })}
                    disabled={modeDone.quiz}
                    className="min-w-[220px]"
                  >
                    Nhận thưởng
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      resetGame('quiz')
                      setScreen('quiz')
                    }}
                  >
                    Chơi lại
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="mt-5 text-base font-extrabold text-slate-900">{q.q}</div>
                <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
                  {q.choices.map((c) => {
                    const picked = quizPick === c
                    const showResult = quizPick !== null
                    const isCorrectChoice = showResult && c === q.answer
                    const isWrongPick = showResult && picked && quizPick !== q.answer

                    return (
                      <button
                        key={c}
                        disabled={quizPick !== null}
                        className={
                          'rounded-2xl border px-4 py-3 text-sm font-extrabold transition focus:outline-none focus:ring-4 focus:ring-sky-100 ' +
                          (isCorrectChoice
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                            : isWrongPick
                              ? 'border-rose-200 bg-rose-50 text-rose-800'
                              : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50')
                        }
                        onClick={() => {
                          setQuizPick(c)
                          const ok = c === q.answer
                          if (ok) {
                            setQuizCorrect((x) => x + 1)
                            setStreak((s) => {
                              const next = s + 1
                              setBestStreak((b) => Math.max(b, next))
                              return next
                            })
                          } else {
                            setStreak(0)
                          }

                          window.setTimeout(() => {
                            const next = quizIndex + 1
                            if (next >= quiz.questions.length) {
                              setQuizDone(true)
                            } else {
                              setQuizIndex(next)
                              setQuizPick(null)
                            }
                          }, 550)
                        }}
                      >
                        {c}
                      </button>
                    )
                  })}
                </div>

                <div className="mt-3 text-xs text-slate-500">Tip: câu hỏi được tạo từ nội dung bài học hôm nay.</div>
              </>
            )}
          </div>
        </div>
      ) : null}

      {/* FLASHCARDS */}
      {screen === 'flashcards' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <BackButton onClick={() => setScreen('hub')} />
            {modeDone.flashcards ? <Badge tone="amber">Đã nhận thưởng</Badge> : <Badge tone="candy">+{reward.flashcards} điểm</Badge>}
          </div>

          <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-card">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-extrabold text-slate-900">Flashcards</div>
                <div className="mt-1 text-sm text-slate-600">Lật thẻ, rồi bấm Tiếp theo để tiếp tục.</div>
              </div>
              <Badge tone="slate">{cardIndex + 1}/{cards.length}</Badge>
            </div>

            <div className="mt-4">
              <ProgressBar value={cardIndex} max={cards.length} />
            </div>

            {cardsDone ? (
              <div className="mt-4 rounded-2xl bg-emerald-50 p-4">
                <div className="text-sm font-extrabold text-emerald-800">Hoàn thành Flashcards!</div>
                <div className="mt-2 text-sm text-emerald-900">Bạn đã xem hết thẻ của hôm nay.</div>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <Button
                    onClick={() => grantOnce({ mode: 'flashcards', points: reward.flashcards, score: cards.length })}
                    disabled={modeDone.flashcards}
                    className="min-w-[220px]"
                  >
                    Nhận thưởng
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      resetGame('flashcards')
                      setScreen('flashcards')
                    }}
                  >
                    Xem lại
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <button
                  onClick={() => setCardFlip((x) => !x)}
                  className="mt-4 w-full rounded-3xl border border-slate-100 bg-slate-50 p-6 text-left shadow-card"
                >
                  <div className="text-xs font-semibold text-slate-600">{cardFlip ? 'Đáp án' : 'Câu hỏi'}</div>
                  <div className="mt-2 text-lg font-extrabold text-slate-900">
                    {cardFlip ? card.back : card.front}
                  </div>
                  <div className="mt-3 text-xs text-slate-500">Chạm để lật</div>
                </button>

                <div className="mt-4 flex items-center justify-between gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (cardIndex === 0) return
                      setCardIndex((x) => x - 1)
                      setCardFlip(false)
                    }}
                    disabled={cardIndex === 0}
                  >
                    Trước
                  </Button>
                  <Button
                    onClick={() => {
                      const next = cardIndex + 1
                      if (next >= cards.length) {
                        setCardsDone(true)
                      } else {
                        setCardIndex(next)
                        setCardFlip(false)
                      }
                    }}
                  >
                    Tiếp theo
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}

      {/* TRUE/FALSE */}
      {screen === 'tf' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <BackButton onClick={() => setScreen('hub')} />
            <div className="flex items-center gap-2">
              <Badge tone="slate"><Timer className="mr-1 inline h-4 w-4" /> {timeLeft}s</Badge>
              <Badge tone="violet">Streak: {streak}</Badge>
              {modeDone.tf ? <Badge tone="amber">Đã nhận thưởng</Badge> : <Badge tone="candy">+{reward.tf} điểm</Badge>}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-card">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-extrabold text-slate-900">Đúng / Sai</div>
                <div className="mt-1 text-sm text-slate-600">
                  Câu {tfIndex + 1}/{tfList.length}
                </div>
              </div>
              <Badge tone="emerald">Đúng: {tfCorrect}</Badge>
            </div>

            <div className="mt-4">
              <ProgressBar value={tfIndex} max={tfList.length} />
            </div>

            {tfDone ? (
              <div className="mt-4 rounded-2xl bg-emerald-50 p-4">
                <div className="text-sm font-extrabold text-emerald-800">Bạn đã hoàn thành!</div>
                <div className="mt-2 text-sm text-emerald-900">Đúng {tfCorrect}/{tfList.length} câu.</div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <Button
                    onClick={() => grantOnce({ mode: 'tf', points: reward.tf, score: tfCorrect + bestStreak })}
                    disabled={modeDone.tf}
                    className="min-w-[220px]"
                  >
                    Nhận thưởng
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      resetGame('tf')
                      setScreen('tf')
                    }}
                  >
                    Chơi lại
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="mt-5 text-base font-extrabold text-slate-900">{tf.statement}</div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  {[
                    { key: true, label: 'Đúng', tone: 'emerald' },
                    { key: false, label: 'Sai', tone: 'rose' },
                  ].map((opt) => {
                    const picked = tfPick === opt.key
                    const showResult = tfPick !== null
                    const isCorrect = showResult && opt.key === tf.answer
                    const isWrong = showResult && picked && tfPick !== tf.answer

                    const base =
                      'rounded-2xl px-4 py-3 text-sm font-extrabold transition focus:outline-none focus:ring-4 focus:ring-sky-100 '

                    let cls = 'border border-slate-200 bg-white text-slate-800 hover:bg-slate-50'
                    const correctTone =
                      opt.tone === 'emerald'
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                        : 'border-rose-200 bg-rose-50 text-rose-800'

                    if (isCorrect) cls = correctTone
                    if (isWrong) cls = 'border-rose-200 bg-rose-50 text-rose-800'

                    return (
                      <button
                        key={String(opt.key)}
                        disabled={tfPick !== null}
                        className={base + cls}
                        onClick={() => {
                          setTfPick(opt.key)
                          const ok = opt.key === tf.answer
                          if (ok) {
                            setTfCorrect((x) => x + 1)
                            setStreak((s) => {
                              const next = s + 1
                              setBestStreak((b) => Math.max(b, next))
                              return next
                            })
                          } else {
                            setStreak(0)
                          }

                          window.setTimeout(() => {
                            const next = tfIndex + 1
                            if (next >= tfList.length) {
                              setTfDone(true)
                            } else {
                              setTfIndex(next)
                              setTfPick(null)
                            }
                          }, 450)
                        }}
                      >
                        {opt.label}
                      </button>
                    )
                  })}
                </div>

                <div className="mt-3 text-xs text-slate-500">Tip: câu đúng/sai được tạo từ bài học hôm nay.</div>
              </>
            )}
          </div>
        </div>
      ) : null}

      {/* MINI GAME */}
      {screen === 'mini' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <BackButton onClick={() => setScreen('hub')} />
            <div className="flex items-center gap-2">
              <Badge tone="slate"><Timer className="mr-1 inline h-4 w-4" /> {timeLeft}s</Badge>
              <Badge tone="violet">Streak: {streak}</Badge>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-card">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-extrabold text-slate-900">{pack.mini?.title || 'Mini Game'}</div>
                <div className="mt-1 text-sm text-slate-600">Câu {miniIndex + 1}/{pack.mini?.rounds?.length || 0} · Best streak: {bestStreak}</div>
              </div>
              <Badge tone="candy">+{reward.mini} điểm</Badge>
            </div>

            <div className="mt-4">
              <ProgressBar value={miniIndex} max={pack.mini?.rounds?.length || 0} />
            </div>

            {miniDone ? (
              <div className="mt-4 rounded-2xl bg-emerald-50 p-4">
                <div className="text-sm font-extrabold text-emerald-800">Hoàn thành Mini Game!</div>
                <div className="mt-2 text-sm text-emerald-900">Điểm: {miniScore} · Best streak: {bestStreak}</div>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <Button
                    onClick={() => grantOnce({ mode: 'mini', points: reward.mini, score: miniScore + bestStreak })}
                    disabled={modeDone.mini}
                    className="min-w-[220px]"
                  >
                    Nhận thưởng
                  </Button>
                  <Button variant="outline" onClick={() => { resetGame('mini'); setScreen('mini') }}>
                    Chơi lại
                  </Button>
                </div>
              </div>
            ) : (
              (() => {
                const mini = pack.mini
                const rounds = mini?.rounds || []
                const cur = rounds[miniIndex]
                if (!mini || !cur) return <div className="mt-4 text-sm text-slate-600">Không có dữ liệu mini game.</div>

                // type pairs: memory / matching 2 cards
                if (mini.type === 'pairs') {
                  const cards = mini.cards || []
                  const matchedPairs = new Set(pairMatchedIds)
                  const revealed = new Set(pairRevealedIds)

                  const allMatched = mini.pairsTotal ? matchedPairs.size >= mini.pairsTotal : false
                  if (allMatched && !miniDone) {
                    window.setTimeout(() => setMiniDone(true), 0)
                  }

                  return (
                    <>
                      <div className="mt-5 text-sm text-slate-600">Chạm 2 thẻ để ghép đúng cặp.</div>
                      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {cards.map((card) => {
                          const isMatched = matchedPairs.has(card.pairId)
                          const isRevealed = revealed.has(card.id) || isMatched
                          return (
                            <button
                              key={card.id}
                              disabled={isMatched || pairSelectedIds.length >= 2}
                              onClick={() => {
                                if (isMatched) return
                                if (pairSelectedIds.includes(card.id)) return

                                setPairSelectedIds((prev) => [...prev, card.id])
                                setPairRevealedIds((prev) => (prev.includes(card.id) ? prev : [...prev, card.id]))

                                const nextSelected = [...pairSelectedIds, card.id]
                                if (nextSelected.length < 2) return

                                const a = cards.find((x) => x.id === nextSelected[0])
                                const b = cards.find((x) => x.id === nextSelected[1])
                                if (!a || !b) return

                                const ok = a.pairId === b.pairId
                                if (ok) {
                                  setMiniScore((s) => s + 1)
                                  setPairMatchedIds((prev) => (prev.includes(a.pairId) ? prev : [...prev, a.pairId]))
                                  setStreak((st) => {
                                    const next = st + 1
                                    setBestStreak((best) => Math.max(best, next))
                                    return next
                                  })

                                  window.setTimeout(() => {
                                    setPairSelectedIds([])
                                  }, 350)
                                } else {
                                  setStreak(0)
                                  window.setTimeout(() => {
                                    setPairRevealedIds((prev) => prev.filter((id) => !nextSelected.includes(id)))
                                    setPairSelectedIds([])
                                  }, 650)
                                }
                              }}
                              className={
                                'min-h-[96px] rounded-3xl border p-3 text-left shadow-card transition focus:outline-none focus:ring-4 focus:ring-sky-100 ' +
                                (isMatched
                                  ? 'border-emerald-200 bg-emerald-50'
                                  : isRevealed
                                    ? 'border-sky-200 bg-sky-50'
                                    : 'border-slate-100 bg-white hover:bg-slate-50')
                              }
                            >
                              <div className="text-[10px] font-semibold text-slate-500">
                                {isMatched ? 'Đã ghép' : isRevealed ? (card.kind === 'term' ? 'Thuật ngữ' : 'Giải thích') : '???'}
                              </div>
                              <div className="mt-1 text-sm font-extrabold text-slate-900">
                                {isRevealed ? card.text : 'Chạm để lật'}
                              </div>
                            </button>
                          )
                        })}
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-600">
                        <Badge tone="emerald">Đúng: {miniScore}</Badge>
                        <Badge tone="slate">Đã ghép: {pairMatchedIds.length}/{mini.pairsTotal || 0}</Badge>
                      </div>
                    </>
                  )
                }

                // default mcq
                return (
                  <>
                    <div className="mt-5 text-base font-extrabold text-slate-900">{cur.prompt}</div>
                    <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
                      {cur.choices.map((c) => {
                        const show = miniPick !== null
                        const isCorrect = show && c === cur.answer
                        const isWrong = show && miniPick === c && miniPick !== cur.answer
                        return (
                          <button
                            key={c}
                            disabled={miniPick !== null}
                            className={
                              'rounded-2xl border px-4 py-3 text-sm font-extrabold transition focus:outline-none focus:ring-4 focus:ring-sky-100 ' +
                              (isCorrect
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                                : isWrong
                                  ? 'border-rose-200 bg-rose-50 text-rose-800'
                                  : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50')
                            }
                            onClick={() => {
                              setMiniPick(c)
                              const ok = c === cur.answer
                              if (ok) {
                                setMiniScore((s) => s + 1)
                                setStreak((st) => {
                                  const next = st + 1
                                  setBestStreak((b) => Math.max(b, next))
                                  return next
                                })
                              } else {
                                setStreak(0)
                              }

                              window.setTimeout(() => {
                                const next = miniIndex + 1
                                if (next >= rounds.length || timeLeft === 0) {
                                  setMiniDone(true)
                                } else {
                                  setMiniIndex(next)
                                  setMiniPick(null)
                                }
                              }, 500)
                            }}
                          >
                            {c}
                          </button>
                        )
                      })}
                    </div>
                  </>
                )
              })()
            )}
          </div>
        </div>
      ) : null}

      {/* LEADERBOARD */}
      {screen === 'leaderboard' ? (
        <div className="space-y-4">
          <BackButton onClick={() => setScreen('hub')} />

          <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-card">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-extrabold text-slate-900">Bảng xếp hạng Daily Review</div>
                <div className="mt-1 text-sm text-slate-600">Lớp {classId} · {data.dateKey}</div>
              </div>
              <Badge tone="slate">Top {board.length}</Badge>
            </div>

            <div className="mt-4 space-y-2">
              {board.map((r, idx) => (
                <div key={r.studentId} className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-extrabold text-slate-900">#{idx + 1} · {r.name}</div>
                      <div className="mt-1 text-xs text-slate-600">Best score: {r.bestScore} · Điểm thưởng: +{r.pointsEarned}</div>
                    </div>
                    <Badge tone={idx === 0 ? 'amber' : idx === 1 ? 'slate' : 'sky'}>{r.bestScore}</Badge>
                  </div>
                </div>
              ))}
              {!board.length ? <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">Chưa có dữ liệu.</div> : null}
            </div>
          </div>
        </div>
      ) : null}

      <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-4 text-xs text-slate-600">
        Gợi ý mở rộng: thêm mini-game “Điền từ” cho Tiếng Việt và “Tính nhanh” cho Toán.
      </div>
    </div>
  )
}
