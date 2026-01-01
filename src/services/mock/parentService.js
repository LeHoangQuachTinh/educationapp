function delay(ms = 500) {
  return new Promise((res) => window.setTimeout(res, ms))
}

// Simple in-memory store for this mock service
const db = {
  feed: null,
  chat: null,
}

function nowMinus(minutes) {
  return Date.now() - minutes * 60 * 1000
}

function buildFeed() {
  return [
    {
      id: 'f_1',
      type: 'ANNOUNCEMENT',
      title: 'Cô giáo: Nhắc nhở nộp quỹ',
      content:
        'Phụ huynh vui lòng nộp quỹ lớp tháng này trước thứ 6. Xin cảm ơn phụ huynh đã phối hợp ạ.',
      authorName: 'Cô Hoa',
      authorAvatar: '👩‍🏫',
      createdAt: nowMinus(25),
    },
    {
      id: 'f_2',
      type: 'ACTIVITY_LOG',
      title: 'Hệ thống: Bé Nam vừa đạt +5 điểm Toán',
      content:
        'Chúc mừng! Bé đã hoàn thành bài tập Toán và được cộng +5 điểm. Tiếp tục cố gắng nhé!',
      icon: '🏆',
      createdAt: nowMinus(90),
    },
    {
      id: 'f_3',
      type: 'ANNOUNCEMENT',
      title: 'Cô giáo: Lịch kiểm tra giữa kỳ',
      content:
        'Tuần tới lớp sẽ có bài kiểm tra giữa kỳ môn Toán và Tiếng Việt. Các con ôn bài theo đề cương đã phát.',
      authorName: 'Cô Hoa',
      authorAvatar: '👩‍🏫',
      createdAt: nowMinus(220),
    },
    {
      id: 'f_4',
      type: 'ACTIVITY_LOG',
      title: 'Hệ thống: Bé Nam được +2 điểm “Phát biểu hay”',
      content:
        'Bé đã phát biểu xây dựng bài rất tự tin trong tiết học. Cô đã cộng +2 điểm.',
      icon: '⭐',
      createdAt: nowMinus(360),
    },
  ]
}

function buildChat() {
  return [
    {
      id: 'm_1',
      from: 'TEACHER',
      text: 'Chào phụ huynh, hôm nay bé tham gia hoạt động nhóm rất tích cực ạ.',
      ts: nowMinus(240),
    },
    {
      id: 'm_2',
      from: 'PARENT',
      text: 'Dạ cảm ơn cô. Bé ở nhà có hơi mệt, nhờ cô để ý giúp ạ.',
      ts: nowMinus(200),
    },
    {
      id: 'm_3',
      from: 'TEACHER',
      text: 'Vâng ạ. Em sẽ quan sát thêm và báo lại phụ huynh nếu có gì cần lưu ý.',
      ts: nowMinus(180),
    },
  ]
}

function ensure() {
  if (!db.feed) db.feed = buildFeed()
  if (!db.chat) db.chat = buildChat()
}

export const parentService = {
  async getParentFeed() {
    await delay(500)
    ensure()
    return [...db.feed].sort((a, b) => b.createdAt - a.createdAt)
  },

  async getChatHistory() {
    await delay(500)
    ensure()
    return [...db.chat].sort((a, b) => a.ts - b.ts)
  },

  async sendMessage(text) {
    await delay(500)
    ensure()

    const msg = {
      id: `m_${Math.random().toString(16).slice(2)}_${Date.now()}`,
      from: 'PARENT',
      text,
      ts: Date.now(),
    }

    db.chat = [...db.chat, msg]

    return msg
  },
}
