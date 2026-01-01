import { uid } from '../components/ui/helpers'

export const ROLES = {
  teacher: 'teacher',
  student: 'student',
  parent: 'parent',
}

export const POINT_CATEGORIES = [
  { key: 'chamChi', label: 'Chăm chỉ', color: 'emerald' },
  { key: 'sangTao', label: 'Sáng tạo', color: 'amber' },
  { key: 'kyLuat', label: 'Kỷ luật', color: 'blue' },
]

export function buildInitialData() {
  const classId = 'class_5A'
  const teacherId = 't_hoa'

  const students = [
    {
      id: 's_minh_anh',
      fullName: 'Nguyễn Minh Anh',
      nickname: 'Mia',
      avatar: { emoji: '🦊', color: 'bg-amber-100', ring: 'ring-amber-200' },
      parent: { name: 'Chị Lan', phone: '0901 234 567', zalo: 'zalo.me/lan5A' },
      healthNotes: ['Dị ứng đậu phộng', 'Nhạy cảm thời tiết lạnh'],
      points: { balance: 120, chamChi: 52, sangTao: 38, kyLuat: 30 },
      attendance: { presentDays: 18, absentDays: 2, lastStatus: 'present' },
      history: [
        { term: 'HK I', subject: 'Toán', grade: '9.0', note: 'Tiến bộ rõ rệt trong giải toán có lời văn.' },
        { term: 'HK I', subject: 'Tiếng Việt', grade: '8.5', note: 'Diễn đạt tốt, cần luyện chữ đẹp hơn.' },
      ],
    },
    {
      id: 's_gia_huy',
      fullName: 'Trần Gia Huy',
      nickname: 'Huy',
      avatar: { emoji: '🐯', color: 'bg-orange-100', ring: 'ring-orange-200' },
      parent: { name: 'Anh Hùng', phone: '0933 888 222', zalo: 'zalo.me/hung5A' },
      healthNotes: ['Cận thị nhẹ – ngồi bàn đầu'],
      points: { balance: 85, chamChi: 28, sangTao: 20, kyLuat: 37 },
      attendance: { presentDays: 19, absentDays: 1, lastStatus: 'present' },
      history: [
        { term: 'HK I', subject: 'Khoa học', grade: '8.0', note: 'Hứng thú với thí nghiệm.' },
        { term: 'HK I', subject: 'Tiếng Anh', grade: '7.5', note: 'Cần tự tin khi nói.' },
      ],
    },
    {
      id: 's_thu_trang',
      fullName: 'Lê Thu Trang',
      nickname: 'Trang',
      avatar: { emoji: '🐼', color: 'bg-slate-100', ring: 'ring-slate-200' },
      parent: { name: 'Cô Hương', phone: '0912 111 999', zalo: 'zalo.me/huong5A' },
      healthNotes: ['Không ăn hải sản'],
      points: { balance: 140, chamChi: 60, sangTao: 52, kyLuat: 28 },
      attendance: { presentDays: 20, absentDays: 0, lastStatus: 'present' },
      history: [
        { term: 'HK I', subject: 'Mỹ thuật', grade: '10', note: 'Rất sáng tạo trong bài vẽ.' },
        { term: 'HK I', subject: 'Tin học', grade: '9.0', note: 'Thao tác nhanh, hỗ trợ bạn tốt.' },
      ],
    },
    {
      id: 's_quoc_bao',
      fullName: 'Phạm Quốc Bảo',
      nickname: 'Bảo',
      avatar: { emoji: '🦁', color: 'bg-yellow-100', ring: 'ring-yellow-200' },
      parent: { name: 'Chị Thủy', phone: '0988 456 000', zalo: 'zalo.me/thuy5A' },
      healthNotes: ['Hen nhẹ – mang ống xịt khi cần'],
      points: { balance: 65, chamChi: 18, sangTao: 12, kyLuat: 35 },
      attendance: { presentDays: 17, absentDays: 3, lastStatus: 'absent' },
      history: [
        { term: 'HK I', subject: 'Đạo đức', grade: '8.5', note: 'Cần kiên nhẫn hơn khi làm việc nhóm.' },
      ],
    },
    {
      id: 's_khanh_linh',
      fullName: 'Vũ Khánh Linh',
      nickname: 'Linh',
      avatar: { emoji: '🐰', color: 'bg-pink-100', ring: 'ring-pink-200' },
      parent: { name: 'Anh Nam', phone: '0909 090 090', zalo: 'zalo.me/nam5A' },
      healthNotes: ['Dễ say xe – tránh hoạt động ngoại khóa xa'],
      points: { balance: 110, chamChi: 40, sangTao: 45, kyLuat: 25 },
      attendance: { presentDays: 20, absentDays: 0, lastStatus: 'present' },
      history: [
        { term: 'HK I', subject: 'Âm nhạc', grade: '9.5', note: 'Hát rõ lời, nhịp tốt.' },
      ],
    },
    {
      id: 's_tuan_kiet',
      fullName: 'Đặng Tuấn Kiệt',
      nickname: 'Kiệt',
      avatar: { emoji: '🦉', color: 'bg-violet-100', ring: 'ring-violet-200' },
      parent: { name: 'Chị Mai', phone: '0977 333 666', zalo: 'zalo.me/mai5A' },
      healthNotes: ['Dị ứng phấn hoa'],
      points: { balance: 95, chamChi: 34, sangTao: 26, kyLuat: 35 },
      attendance: { presentDays: 18, absentDays: 2, lastStatus: 'present' },
      history: [
        { term: 'HK I', subject: 'Lịch sử', grade: '8.0', note: 'Nhớ sự kiện tốt, cần trình bày mạch lạc.' },
      ],
    },
  ]

  // seating: 4 columns x 3 rows
  const seating = {
    columns: 4,
    rows: 3,
    positions: {
      s_minh_anh: { x: 1, y: 0 },
      s_gia_huy: { x: 0, y: 0 },
      s_thu_trang: { x: 2, y: 0 },
      s_quoc_bao: { x: 3, y: 0 },
      s_khanh_linh: { x: 1, y: 1 },
      s_tuan_kiet: { x: 2, y: 1 },
    },
  }

  const syllabus = {
    id: 'syllabus_2025',
    schoolYear: '2025–2026',
    weeks: [
      {
        week: 12,
        title: 'Tuần 12 – Giữ nề nếp, tăng tương tác',
        subjects: [
          {
            id: 'sub_toan',
            name: 'Toán',
            lessons: [
              {
                id: 'l_toan_12_1',
                title: 'Phân số – So sánh và rút gọn',
                objective:
                  'HS biết rút gọn phân số và so sánh 2 phân số bằng nhiều cách.',
                content:
                  'Ôn khái niệm phân số; rút gọn; quy đồng; so sánh; bài tập tình huống.',
              },
              {
                id: 'l_toan_12_2',
                title: 'Bài toán có lời văn: Tỉ số',
                objective: 'HS giải bài toán tỉ số bằng sơ đồ đoạn thẳng.',
                content:
                  'Luyện mô hình hóa bài toán; chọn phép tính; trình bày lời giải rõ ràng.',
              },
            ],
          },
          {
            id: 'sub_tieng_viet',
            name: 'Tiếng Việt',
            lessons: [
              {
                id: 'l_tv_12_1',
                title: 'Tập làm văn: Kể chuyện sáng tạo',
                objective: 'HS kể chuyện theo tranh, thêm chi tiết hợp lý.',
                content:
                  'Xây dựng nhân vật; mở đầu hấp dẫn; kết thúc ý nghĩa; luyện nói trước lớp.',
              },
            ],
          },
          {
            id: 'sub_khoa_hoc',
            name: 'Khoa học',
            lessons: [
              {
                id: 'l_kh_12_1',
                title: 'Hệ hô hấp: Bảo vệ phổi',
                objective: 'HS hiểu vai trò phổi và cách giữ vệ sinh hô hấp.',
                content:
                  'Quan sát tranh; thảo luận thói quen tốt; mini game “Hít thở sâu”.',
              },
            ],
          },
        ],
      },
    ],
  }

  // weekly schedule: Mon-Fri x 5 slots
  const weekTemplate = {
    days: ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6'],
    slots: [
      { id: 's1', label: 'Tiết 1', time: '07:30–08:10' },
      { id: 's2', label: 'Tiết 2', time: '08:15–08:55' },
      { id: 's3', label: 'Tiết 3', time: '09:10–09:50' },
      { id: 's4', label: 'Tiết 4', time: '10:00–10:40' },
      { id: 's5', label: 'Tiết 5', time: '10:45–11:25' },
    ],
  }

  const schedule = {
    week: 12,
    // map key `${dayIndex}_${slotIndex}` => lessonRef
    cells: {
      '0_0': { subjectId: 'sub_toan', lessonId: 'l_toan_12_1' },
      '0_1': { subjectId: 'sub_tieng_viet', lessonId: 'l_tv_12_1' },
      '0_2': { subjectId: 'sub_khoa_hoc', lessonId: 'l_kh_12_1' },
      '1_0': { subjectId: 'sub_toan', lessonId: 'l_toan_12_2' },
      '2_0': { subjectId: 'sub_tieng_viet', lessonId: 'l_tv_12_1' },
      '3_0': { subjectId: 'sub_khoa_hoc', lessonId: 'l_kh_12_1' },
      '4_0': { subjectId: 'sub_toan', lessonId: 'l_toan_12_1' },
    },
    template: weekTemplate,
  }

  const logbook = {
    // key: `${week}_${dayIndex}_${slotIndex}`
    entries: {
      '12_0_0': {
        status: 'completed',
        rating: 4,
        absentees: ['s_quoc_bao'],
        teacherNotes: 'Cả lớp tham gia tốt, cần thêm 5 phút cho phần luyện tập.' ,
        signedBy: 'Cô Hoa',
        submittedAt: Date.now() - 1000 * 60 * 60 * 24,
      },
    },
  }

  const announcements = [
    {
      id: uid('feed'),
      author: 'Cô Hoa',
      title: 'Thông báo: Nộp bài dự án “Góc xanh lớp em”',
      content:
        'Các con hoàn thiện sản phẩm và nộp trước thứ 6. Phụ huynh hỗ trợ chuẩn bị vật liệu tái chế (chai nhựa, giấy màu).',
      createdAt: Date.now() - 1000 * 60 * 60 * 6,
    },
    {
      id: uid('feed'),
      author: 'Nhà trường',
      title: 'Lịch khám sức khỏe định kỳ',
      content:
        'Thứ 4 tuần này, đội ngũ y tế sẽ khám sức khỏe. Các con ăn sáng đầy đủ và mang theo thẻ BHYT.',
      createdAt: Date.now() - 1000 * 60 * 60 * 30,
    },
  ]

  const chatThreads = {
    // thread between teacher and each parent (simulated)
    s_minh_anh: {
      participantParent: 'Chị Lan',
      messages: [
        {
          id: uid('msg'),
          from: 'parent',
          text: 'Cô ơi, hôm nay Minh Anh có tham gia hoạt động nhóm tốt không ạ?',
          ts: Date.now() - 1000 * 60 * 40,
        },
        {
          id: uid('msg'),
          from: 'teacher',
          text: 'Dạ có chị, bạn rất tích cực và biết lắng nghe bạn khác. Em vừa cộng điểm “Chăm chỉ”.',
          ts: Date.now() - 1000 * 60 * 35,
        },
      ],
    },
  }

  const storeItems = [
    {
      id: 'item_hat_rainbow',
      name: 'Mũ cầu vồng',
      cost: 80,
      icon: '🎩',
      description: 'Đội mũ là auto vui vẻ cả ngày.',
    },
    {
      id: 'item_no_hw',
      name: 'Thẻ “Miễn bài tập về nhà”',
      cost: 120,
      icon: '🪪',
      description: 'Dùng 1 lần để xin giảm/miễn 1 bài tập.',
    },
    {
      id: 'item_pet_cat',
      name: 'Thú cưng: Mèo mướp',
      cost: 150,
      icon: '🐱',
      description: 'Một người bạn luôn “meo meo” cổ vũ.',
    },
    {
      id: 'item_sticker',
      name: 'Bộ sticker “Cố lên!”',
      cost: 30,
      icon: '✨',
      description: 'Sticker nhắc nhở tích cực trong học tập.',
    },
  ]

  return {
    meta: { classId, teacherId },
    currentRole: ROLES.teacher,
    currentStudentId: students[0].id,
    teacher: { id: teacherId, name: 'Cô Nguyễn Thu Hoa', className: 'Lớp 5A' },
    students,
    seating,
    syllabus,
    schedule,
    logbook,
    announcements,
    chatThreads,
    storeItems,
    inventoryByStudent: {
      s_minh_anh: ['item_sticker'],
      s_gia_huy: [],
      s_thu_trang: ['item_hat_rainbow'],
      s_quoc_bao: [],
      s_khanh_linh: [],
      s_tuan_kiet: [],
    },
    pointEvents: [
      {
        id: uid('pe'),
        studentId: 's_thu_trang',
        delta: 5,
        category: 'sangTao',
        reason: 'Thuyết trình tự tin, hỗ trợ bạn.',
        ts: Date.now() - 1000 * 60 * 60 * 12,
      },
      {
        id: uid('pe'),
        studentId: 's_quoc_bao',
        delta: -2,
        category: 'kyLuat',
        reason: 'Nói chuyện trong giờ.',
        ts: Date.now() - 1000 * 60 * 60 * 20,
      },
    ],
  }
}

export function findLesson(syllabus, subjectId, lessonId) {
  for (const w of syllabus.weeks) {
    for (const s of w.subjects) {
      if (s.id !== subjectId) continue
      for (const l of s.lessons) {
        if (l.id === lessonId) return { week: w.week, subject: s, lesson: l }
      }
    }
  }
  return null
}
