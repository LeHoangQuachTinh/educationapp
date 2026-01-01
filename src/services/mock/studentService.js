function delay(ms = 500) {
  return new Promise((res) => window.setTimeout(res, ms))
}

export const studentService = {
  async getStudentInfo(id) {
    await delay(500)
    // mock by id
    if (id === 'stu_5A_1') {
      return {
        id: 'stu_5A_1',
        avatar: '🦊',
        className: 'Lớp 5A',
        classId: '5A',
        points: 150,
      }
    }
    return {
      id,
      avatar: '🙂',
      className: 'Lớp ?',
      points: 0,
    }
  },

  async getDailyTasks() {
    await delay(500)
    return [
      { id: 't1', title: 'Hoàn thành bài tập Toán', xp: 10 },
      { id: 't2', title: 'Đọc 5 trang sách', xp: 5 },
      { id: 't3', title: 'Luyện viết: 1 đoạn văn ngắn', xp: 8 },
      { id: 't4', title: 'Ôn từ vựng Tiếng Anh', xp: 6 },
    ]
  },

  async getStorePreview() {
    await delay(500)
    return [
      { id: 'i1', name: 'Mũ cam năng lượng', cost: 80, icon: '🧢' },
      { id: 'i2', name: 'Sticker “Cố lên!”', cost: 30, icon: '✨' },
      { id: 'i3', name: 'Thẻ “Miễn BTVN”', cost: 120, icon: '🪪' },
    ]
  },
}
