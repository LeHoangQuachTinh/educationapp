/**
 * Class Management Service
 * Professional class management with students, parents, seating
 */

function delay(ms = 500) {
  return new Promise((res) => window.setTimeout(res, ms))
}

function uid(prefix = 'id') {
  return `${Math.random().toString(16).slice(2)}_${Date.now()}`
}

// In-memory database
const db = {
  classes: [],
  students: [],
  parents: [],
  seatingCharts: [],
}

// Seed data
function ensureSeed() {
  if (db.classes.length) return

  // Classes
  db.classes = [
    {
      id: '5A',
      name: '5A',
      grade: 5,
      schoolYear: '2025-2026',
      homeRoomTeacher: 'gv1',
      capacity: 40,
      room: 'A101',
      description: 'Lớp 5A - Năng khiếu Toán',
      color: 'sky',
      icon: '🎯',
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 90,
    },
    {
      id: '5B',
      name: '5B',
      grade: 5,
      schoolYear: '2025-2026',
      homeRoomTeacher: 'gv1',
      capacity: 35,
      room: 'A102',
      description: 'Lớp 5B - Tiếng Anh nâng cao',
      color: 'emerald',
      icon: '🌟',
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 85,
    },
  ]

  // Students for 5A
  db.students = [
    {
      id: 'hs1',
      studentCode: 'HS001',
      classId: '5A',
      fullName: 'Nguyễn Văn An',
      gender: 'male',
      dateOfBirth: '2015-05-15',
      avatar: null,
      parentIds: ['ph1'],
      seatNumber: 1,
      status: 'active', // active, inactive, transferred
      address: '123 Đường ABC, Quận 1, TP.HCM',
      phone: '0901234567',
      email: 'nva@email.com',
      currentPoints: 850,
      academicPerformance: 'excellent', // excellent, good, average, below-average
      conduct: 'good', // excellent, good, average, poor
      notes: 'Học sinh giỏi, tích cực',
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 90,
    },
    {
      id: 'hs2',
      studentCode: 'HS002',
      classId: '5A',
      fullName: 'Trần Thị Bình',
      gender: 'female',
      dateOfBirth: '2015-03-20',
      avatar: null,
      parentIds: ['ph2'],
      seatNumber: 2,
      status: 'active',
      address: '456 Đường XYZ, Quận 2, TP.HCM',
      phone: '0901234568',
      email: 'ttb@email.com',
      currentPoints: 920,
      academicPerformance: 'excellent',
      conduct: 'excellent',
      notes: 'Lớp trưởng',
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 90,
    },
    {
      id: 'hs3',
      studentCode: 'HS003',
      classId: '5A',
      fullName: 'Lê Văn Công',
      gender: 'male',
      dateOfBirth: '2015-07-10',
      avatar: null,
      parentIds: ['ph3'],
      seatNumber: 3,
      status: 'active',
      address: '789 Đường DEF, Quận 3, TP.HCM',
      phone: '0901234569',
      email: 'lvc@email.com',
      currentPoints: 750,
      academicPerformance: 'good',
      conduct: 'good',
      notes: '',
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 90,
    },
  ]

  // Parents
  db.parents = [
    {
      id: 'ph1',
      fullName: 'Nguyễn Văn Cha',
      relationship: 'father',
      phone: '0912345678',
      email: 'nvcha@email.com',
      occupation: 'Kỹ sư',
      address: '123 Đường ABC, Quận 1, TP.HCM',
      studentIds: ['hs1'],
      isMainContact: true,
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 90,
    },
    {
      id: 'ph2',
      fullName: 'Trần Thị Mẹ',
      relationship: 'mother',
      phone: '0912345679',
      email: 'ttme@email.com',
      occupation: 'Giáo viên',
      address: '456 Đường XYZ, Quận 2, TP.HCM',
      studentIds: ['hs2'],
      isMainContact: true,
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 90,
    },
    {
      id: 'ph3',
      fullName: 'Lê Văn Ông',
      relationship: 'grandfather',
      phone: '0912345680',
      email: 'lvong@email.com',
      occupation: 'Hưu trí',
      address: '789 Đường DEF, Quận 3, TP.HCM',
      studentIds: ['hs3'],
      isMainContact: true,
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 90,
    },
  ]

  // Seating chart for 5A
  db.seatingCharts = [
    {
      id: 'seat_5A_1',
      classId: '5A',
      name: 'Sơ đồ mặc định',
      rows: 5,
      cols: 8,
      layout: [
        // row 0
        { row: 0, col: 0, studentId: 'hs1', type: 'student' },
        { row: 0, col: 1, studentId: 'hs2', type: 'student' },
        { row: 0, col: 2, studentId: 'hs3', type: 'student' },
        { row: 0, col: 3, studentId: null, type: 'empty' },
        { row: 0, col: 4, studentId: null, type: 'empty' },
        { row: 0, col: 5, studentId: null, type: 'empty' },
        { row: 0, col: 6, studentId: null, type: 'empty' },
        { row: 0, col: 7, studentId: null, type: 'empty' },
      ],
      isActive: true,
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 80,
    },
  ]
}

export const classManagementService = {
  /**
   * Get all classes for a teacher
   */
  async getClasses(teacherId) {
    await delay(400)
    ensureSeed()

    return db.classes
      .filter((c) => c.homeRoomTeacher === teacherId)
      .map((c) => {
        const studentCount = db.students.filter(
          (s) => s.classId === c.id && s.status === 'active',
        ).length
        return { ...c, studentCount }
      })
      .sort((a, b) => b.createdAt - a.createdAt)
  },

  /**
   * Get class details
   */
  async getClass(classId) {
    await delay(300)
    ensureSeed()

    const cls = db.classes.find((c) => c.id === classId)
    if (!cls) throw new Error('Không tìm thấy lớp học')

    const students = db.students.filter(
      (s) => s.classId === classId && s.status === 'active',
    )

    return {
      ...cls,
      studentCount: students.length,
    }
  },

  /**
   * Create new class
   */
  async createClass(data) {
    await delay(500)
    ensureSeed()

    // Check duplicate name
    if (db.classes.some((c) => c.name === data.name)) {
      throw new Error('Tên lớp đã tồn tại')
    }

    const newClass = {
      id: uid('class'),
      name: data.name,
      grade: data.grade,
      schoolYear: data.schoolYear || '2025-2026',
      homeRoomTeacher: data.homeRoomTeacher,
      capacity: data.capacity || 40,
      room: data.room || '',
      description: data.description || '',
      color: data.color || 'sky',
      icon: data.icon || '📚',
      createdAt: Date.now(),
    }

    db.classes.push(newClass)

    // Create default seating chart
    const rows = Math.ceil(newClass.capacity / 8)
    const cols = 8
    const layout = []
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        layout.push({ row: r, col: c, studentId: null, type: 'empty' })
      }
    }

    db.seatingCharts.push({
      id: uid('seat'),
      classId: newClass.id,
      name: 'Sơ đồ mặc định',
      rows,
      cols,
      layout,
      isActive: true,
      createdAt: Date.now(),
    })

    return newClass
  },

  /**
   * Update class
   */
  async updateClass(classId, data) {
    await delay(400)
    ensureSeed()

    const cls = db.classes.find((c) => c.id === classId)
    if (!cls) throw new Error('Không tìm thấy lớp học')

    // Check duplicate name
    if (
      data.name &&
      data.name !== cls.name &&
      db.classes.some((c) => c.name === data.name)
    ) {
      throw new Error('Tên lớp đã tồn tại')
    }

    Object.assign(cls, data)
    return cls
  },

  /**
   * Delete class
   */
  async deleteClass(classId) {
    await delay(300)
    ensureSeed()

    const index = db.classes.findIndex((c) => c.id === classId)
    if (index < 0) throw new Error('Không tìm thấy lớp học')

    // Check if has students
    const hasStudents = db.students.some(
      (s) => s.classId === classId && s.status === 'active',
    )
    if (hasStudents) {
      throw new Error('Không thể xóa lớp đang có học sinh')
    }

    db.classes.splice(index, 1)

    // Delete seating charts
    db.seatingCharts = db.seatingCharts.filter((s) => s.classId !== classId)

    return { success: true }
  },

  /**
   * Get students in class
   */
  async getStudents(classId) {
    await delay(400)
    ensureSeed()

    const students = db.students
      .filter((s) => s.classId === classId)
      .sort((a, b) => a.seatNumber - b.seatNumber)

    // Attach parent info
    return students.map((s) => {
      const parents = db.parents.filter((p) => p.studentIds.includes(s.id))
      return { ...s, parents }
    })
  },

  /**
   * Add student to class
   */
  async addStudent(data) {
    await delay(500)
    ensureSeed()

    // Check duplicate student code
    if (db.students.some((s) => s.studentCode === data.studentCode)) {
      throw new Error('Mã học sinh đã tồn tại')
    }

    const newStudent = {
      id: uid('hs'),
      studentCode: data.studentCode,
      classId: data.classId,
      fullName: data.fullName,
      gender: data.gender,
      dateOfBirth: data.dateOfBirth,
      avatar: data.avatar || null,
      parentIds: [],
      seatNumber: data.seatNumber || 0,
      status: 'active',
      address: data.address || '',
      phone: data.phone || '',
      email: data.email || '',
      currentPoints: 0,
      academicPerformance: data.academicPerformance || 'average',
      conduct: data.conduct || 'good',
      notes: data.notes || '',
      createdAt: Date.now(),
    }

    db.students.push(newStudent)
    return newStudent
  },

  /**
   * Update student
   */
  async updateStudent(studentId, data) {
    await delay(400)
    ensureSeed()

    const student = db.students.find((s) => s.id === studentId)
    if (!student) throw new Error('Không tìm thấy học sinh')

    // Check duplicate student code
    if (
      data.studentCode &&
      data.studentCode !== student.studentCode &&
      db.students.some((s) => s.studentCode === data.studentCode)
    ) {
      throw new Error('Mã học sinh đã tồn tại')
    }

    Object.assign(student, data)
    return student
  },

  /**
   * Delete student (soft delete)
   */
  async deleteStudent(studentId) {
    await delay(300)
    ensureSeed()

    const student = db.students.find((s) => s.id === studentId)
    if (!student) throw new Error('Không tìm thấy học sinh')

    student.status = 'inactive'
    return { success: true }
  },

  /**
   * Get parents for a student or class
   */
  async getParents({ studentId, classId }) {
    await delay(300)
    ensureSeed()

    if (studentId) {
      return db.parents.filter((p) => p.studentIds.includes(studentId))
    }

    if (classId) {
      const studentIds = db.students
        .filter((s) => s.classId === classId && s.status === 'active')
        .map((s) => s.id)

      return db.parents.filter((p) =>
        p.studentIds.some((sid) => studentIds.includes(sid)),
      )
    }

    return []
  },

  /**
   * Add parent
   */
  async addParent(data) {
    await delay(400)
    ensureSeed()

    const newParent = {
      id: uid('ph'),
      fullName: data.fullName,
      relationship: data.relationship,
      phone: data.phone,
      email: data.email || '',
      occupation: data.occupation || '',
      address: data.address || '',
      studentIds: data.studentIds || [],
      isMainContact: data.isMainContact ?? false,
      createdAt: Date.now(),
    }

    db.parents.push(newParent)

    // Update student's parent list
    data.studentIds?.forEach((sid) => {
      const student = db.students.find((s) => s.id === sid)
      if (student && !student.parentIds.includes(newParent.id)) {
        student.parentIds.push(newParent.id)
      }
    })

    return newParent
  },

  /**
   * Update parent
   */
  async updateParent(parentId, data) {
    await delay(400)
    ensureSeed()

    const parent = db.parents.find((p) => p.id === parentId)
    if (!parent) throw new Error('Không tìm thấy phụ huynh')

    Object.assign(parent, data)
    return parent
  },

  /**
   * Delete parent
   */
  async deleteParent(parentId) {
    await delay(300)
    ensureSeed()

    const index = db.parents.findIndex((p) => p.id === parentId)
    if (index < 0) throw new Error('Không tìm thấy phụ huynh')

    const parent = db.parents[index]

    // Remove from students
    parent.studentIds.forEach((sid) => {
      const student = db.students.find((s) => s.id === sid)
      if (student) {
        student.parentIds = student.parentIds.filter((pid) => pid !== parentId)
      }
    })

    db.parents.splice(index, 1)
    return { success: true }
  },

  /**
   * Get seating chart for class
   */
  async getSeatingChart(classId) {
    await delay(300)
    ensureSeed()

    const chart = db.seatingCharts.find(
      (s) => s.classId === classId && s.isActive,
    )
    if (!chart) {
      throw new Error('Không tìm thấy sơ đồ chỗ ngồi')
    }

    // Attach student info to seats
    const layoutWithStudents = chart.layout.map((seat) => {
      if (seat.studentId) {
        const student = db.students.find((s) => s.id === seat.studentId)
        return { ...seat, student: student || null }
      }
      return seat
    })

    return { ...chart, layout: layoutWithStudents }
  },

  /**
   * Update seating chart
   */
  async updateSeatingChart(classId, layout) {
    await delay(400)
    ensureSeed()

    const chart = db.seatingCharts.find(
      (s) => s.classId === classId && s.isActive,
    )
    if (!chart) throw new Error('Không tìm thấy sơ đồ chỗ ngồi')

    chart.layout = layout
    chart.updatedAt = Date.now()

    // Update student seat numbers
    layout.forEach((seat, index) => {
      if (seat.studentId) {
        const student = db.students.find((s) => s.id === seat.studentId)
        if (student) {
          student.seatNumber = index + 1
        }
      }
    })

    return chart
  },

  /**
   * Get class statistics
   */
  async getClassStats(classId) {
    await delay(300)
    ensureSeed()

    const students = db.students.filter(
      (s) => s.classId === classId && s.status === 'active',
    )

    const stats = {
      total: students.length,
      male: students.filter((s) => s.gender === 'male').length,
      female: students.filter((s) => s.gender === 'female').length,
      performance: {
        excellent: students.filter((s) => s.academicPerformance === 'excellent')
          .length,
        good: students.filter((s) => s.academicPerformance === 'good').length,
        average: students.filter((s) => s.academicPerformance === 'average')
          .length,
        belowAverage: students.filter(
          (s) => s.academicPerformance === 'below-average',
        ).length,
      },
      conduct: {
        excellent: students.filter((s) => s.conduct === 'excellent').length,
        good: students.filter((s) => s.conduct === 'good').length,
        average: students.filter((s) => s.conduct === 'average').length,
        poor: students.filter((s) => s.conduct === 'poor').length,
      },
      averagePoints:
        students.length > 0
          ? Math.round(
              students.reduce((sum, s) => sum + s.currentPoints, 0) /
                students.length,
            )
          : 0,
    }

    return stats
  },
}
