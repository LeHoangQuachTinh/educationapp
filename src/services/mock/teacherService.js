function delay(ms = 500) {
  return new Promise((res) => window.setTimeout(res, ms))
}

// In-memory DB (mock)
const db = {
  classes: new Map(), // classId -> students[]
  teacherClasses: new Map(), // teacherId -> class summaries
}

function buildStudents(classId) {
  // 20 students, positions for a 5x4 seating grid
  const names = [
    'Lê Văn Tâm',
    'Trần Thị Lan',
    'Nguyễn Minh Anh',
    'Phạm Quốc Bảo',
    'Vũ Khánh Linh',
    'Đặng Tuấn Kiệt',
    'Hoàng Gia Huy',
    'Lý Thu Trang',
    'Bùi Nhật Minh',
    'Đỗ Hải Yến',
    'Ngô Quang Hưng',
    'Phan Thảo Nhi',
    'Lưu Đức Long',
    'Mai Thanh Tùng',
    'Trịnh Bảo Ngọc',
    'Tạ Anh Quân',
    'Đinh Mỹ Linh',
    'Hồ Thanh Trúc',
    'Dương Hồng Phúc',
    'Nguyễn Thảo Vy',
  ]

  const avatars = ['🦊', '🐯', '🐼', '🦁', '🐰', '🦉', '🐸', '🐨', '🐵', '🐹']
  const statuses = ['Present', 'Absent', 'Late']

  return names.map((name, idx) => {
    const x = idx % 5
    const y = Math.floor(idx / 5)
    const seeded = (idx * 17 + classId.length * 13) % 200

    return {
      id: `stu_${classId}_${idx + 1}`,
      name,
      avatar: avatars[idx % avatars.length],
      currentPoints: 50 + seeded,
      position: { x, y },
      status: statuses[idx % statuses.length],
      classId,
      className: `Lớp ${classId}`,
    }
  })
}

function ensureTeacher(teacherId = 'gv1') {
  if (db.teacherClasses.has(teacherId)) return

  // Example: 1 teacher manages multiple classes
  const classes = [
    { id: '5A', name: 'Lớp 5A', grade: 5 },
    { id: '5B', name: 'Lớp 5B', grade: 5 },
    { id: '6A', name: 'Lớp 6A', grade: 6 },
  ]

  db.teacherClasses.set(teacherId, classes)

  // seed class students
  for (const c of classes) {
    if (!db.classes.has(c.id)) db.classes.set(c.id, buildStudents(c.id))
  }
}

function getOrCreateClass(classId) {
  if (!db.classes.has(classId)) {
    db.classes.set(classId, buildStudents(classId))
  }
  return db.classes.get(classId)
}

export const teacherService = {
  async getTeacherClasses(teacherId = 'gv1') {
    await delay(500)
    ensureTeacher(teacherId)
    return db.teacherClasses.get(teacherId).map((c) => ({ ...c }))
  },

  async getClassList(classId = '5A') {
    await delay(500)
    // return a copy to simulate API payload
    return getOrCreateClass(classId).map((s) => ({ ...s, position: { ...s.position } }))
  },

  async updateStudentPoints(studentId, amount, reason = '') {
    await delay(500)
    // Find student across all classes
    for (const [classId, students] of db.classes.entries()) {
      const idx = students.findIndex((s) => s.id === studentId)
      if (idx >= 0) {
        const next = {
          ...students[idx],
          currentPoints: Math.max(0, (students[idx].currentPoints || 0) + amount),
        }
        students[idx] = next
        db.classes.set(classId, students)

        return {
          studentId,
          classId,
          newPoints: next.currentPoints,
          amount,
          reason,
        }
      }
    }

    const err = new Error('Không tìm thấy học sinh')
    err.code = 'NOT_FOUND'
    throw err
  },

  async updateAttendance(studentId, status) {
    await delay(500)

    for (const [classId, students] of db.classes.entries()) {
      const idx = students.findIndex((s) => s.id === studentId)
      if (idx >= 0) {
        const next = { ...students[idx], status }
        students[idx] = next
        db.classes.set(classId, students)
        return { studentId, classId, status }
      }
    }

    const err = new Error('Không tìm thấy học sinh')
    err.code = 'NOT_FOUND'
    throw err
  },
}
