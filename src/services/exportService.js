/**
 * Export Service - Export data to Excel and PDF
 */
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

export const exportService = {
  /**
   * Export students list to Excel
   */
  exportStudentsToExcel(students, className = 'Danh sách học sinh') {
    const worksheet_data = [
      // Header row
      ['STT', 'Mã HS', 'Họ và tên', 'Giới tính', 'Ngày sinh', 'Số điện thoại', 'Email', 'Địa chỉ', 'Học lực', 'Hạnh kiểm', 'Điểm thưởng', 'Ghi chú'],
      // Data rows
      ...students.map((student, index) => [
        index + 1,
        student.studentCode || '',
        student.fullName || '',
        student.gender === 'male' ? 'Nam' : 'Nữ',
        student.dateOfBirth || '',
        student.phone || '',
        student.email || '',
        student.address || '',
        this._translatePerformance(student.academicPerformance),
        this._translateConduct(student.conduct),
        student.currentPoints || 0,
        student.notes || '',
      ]),
    ]

    const ws = XLSX.utils.aoa_to_sheet(worksheet_data)

    // Set column widths
    ws['!cols'] = [
      { wch: 5 },  // STT
      { wch: 10 }, // Mã HS
      { wch: 20 }, // Họ tên
      { wch: 10 }, // Giới tính
      { wch: 12 }, // Ngày sinh
      { wch: 15 }, // SĐT
      { wch: 25 }, // Email
      { wch: 30 }, // Địa chỉ
      { wch: 12 }, // Học lực
      { wch: 12 }, // Hạnh kiểm
      { wch: 12 }, // Điểm
      { wch: 30 }, // Ghi chú
    ]

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Danh sách học sinh')

    const filename = `${className}_${new Date().toISOString().split('T')[0]}.xlsx`
    XLSX.writeFile(wb, filename)

    return { success: true, filename }
  },

  /**
   * Export students list to PDF
   */
  exportStudentsToPDF(students, classInfo) {
    const doc = new jsPDF('landscape')

    // Title
    doc.setFontSize(16)
    doc.text(`DANH SÁCH HỌC SINH - ${classInfo.name}`, 15, 15)

    // Class info
    doc.setFontSize(10)
    doc.text(`Phòng: ${classInfo.room || 'N/A'}`, 15, 25)
    doc.text(`Sĩ số: ${students.length}/${classInfo.capacity}`, 15, 30)
    doc.text(`Năm học: ${classInfo.schoolYear}`, 15, 35)
    doc.text(`Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}`, 15, 40)

    // Table
    const tableData = students.map((student, index) => [
      index + 1,
      student.studentCode || '',
      student.fullName || '',
      student.gender === 'male' ? 'Nam' : 'Nữ',
      student.dateOfBirth || '',
      student.phone || '',
      this._translatePerformance(student.academicPerformance),
      this._translateConduct(student.conduct),
      student.currentPoints || 0,
    ])

    doc.autoTable({
      startY: 45,
      head: [['STT', 'Mã HS', 'Họ và tên', 'GT', 'Ngày sinh', 'SĐT', 'Học lực', 'Hạnh kiểm', 'Điểm']],
      body: tableData,
      styles: { fontSize: 8, font: 'helvetica' },
      headStyles: { fillColor: [14, 165, 233] }, // sky-600
      alternateRowStyles: { fillColor: [241, 245, 249] }, // slate-100
    })

    const filename = `${classInfo.name}_${new Date().toISOString().split('T')[0]}.pdf`
    doc.save(filename)

    return { success: true, filename }
  },

  /**
   * Export parents list to Excel
   */
  exportParentsToExcel(parents, className = 'Danh sách phụ huynh') {
    const worksheet_data = [
      // Header row
      ['STT', 'Họ và tên', 'Quan hệ', 'Số điện thoại', 'Email', 'Nghề nghiệp', 'Địa chỉ', 'Liên hệ chính'],
      // Data rows
      ...parents.map((parent, index) => [
        index + 1,
        parent.fullName || '',
        this._translateRelationship(parent.relationship),
        parent.phone || '',
        parent.email || '',
        parent.occupation || '',
        parent.address || '',
        parent.isMainContact ? 'Có' : 'Không',
      ]),
    ]

    const ws = XLSX.utils.aoa_to_sheet(worksheet_data)

    // Set column widths
    ws['!cols'] = [
      { wch: 5 },  // STT
      { wch: 20 }, // Họ tên
      { wch: 15 }, // Quan hệ
      { wch: 15 }, // SĐT
      { wch: 25 }, // Email
      { wch: 20 }, // Nghề nghiệp
      { wch: 35 }, // Địa chỉ
      { wch: 12 }, // Liên hệ chính
    ]

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Danh sách phụ huynh')

    const filename = `PH_${className}_${new Date().toISOString().split('T')[0]}.xlsx`
    XLSX.writeFile(wb, filename)

    return { success: true, filename }
  },

  /**
   * Export class statistics to PDF
   */
  exportStatsToPDF(classInfo, stats) {
    const doc = new jsPDF()

    // Title
    doc.setFontSize(18)
    doc.text(`BÁO CÁO THỐNG KÊ - ${classInfo.name}`, 15, 20)

    // Class info
    doc.setFontSize(11)
    doc.text(`Phòng: ${classInfo.room || 'N/A'}`, 15, 35)
    doc.text(`Năm học: ${classInfo.schoolYear}`, 15, 42)
    doc.text(`Khối: ${classInfo.grade}`, 15, 49)
    doc.text(`Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}`, 15, 56)

    // Overview
    doc.setFontSize(14)
    doc.text('TỔNG QUAN', 15, 70)
    doc.setFontSize(11)
    doc.text(`Sĩ số: ${stats.total}/${classInfo.capacity}`, 20, 80)
    doc.text(`Nam: ${stats.male} (${((stats.male / stats.total) * 100).toFixed(1)}%)`, 20, 87)
    doc.text(`Nữ: ${stats.female} (${((stats.female / stats.total) * 100).toFixed(1)}%)`, 20, 94)
    doc.text(`Điểm thưởng TB: ${stats.averagePoints}`, 20, 101)

    // Academic Performance
    doc.setFontSize(14)
    doc.text('HỌC LỰC', 15, 115)
    const performanceData = [
      ['Giỏi', stats.performance.excellent, `${((stats.performance.excellent / stats.total) * 100).toFixed(1)}%`],
      ['Khá', stats.performance.good, `${((stats.performance.good / stats.total) * 100).toFixed(1)}%`],
      ['Trung bình', stats.performance.average, `${((stats.performance.average / stats.total) * 100).toFixed(1)}%`],
      ['Yếu', stats.performance.belowAverage, `${((stats.performance.belowAverage / stats.total) * 100).toFixed(1)}%`],
    ]

    doc.autoTable({
      startY: 120,
      head: [['Xếp loại', 'Số lượng', 'Tỷ lệ']],
      body: performanceData,
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129] }, // emerald-600
    })

    // Conduct
    doc.setFontSize(14)
    doc.text('HẠNH KIỂM', 15, doc.lastAutoTable.finalY + 15)
    const conductData = [
      ['Tốt', stats.conduct.excellent, `${((stats.conduct.excellent / stats.total) * 100).toFixed(1)}%`],
      ['Khá', stats.conduct.good, `${((stats.conduct.good / stats.total) * 100).toFixed(1)}%`],
      ['Trung bình', stats.conduct.average, `${((stats.conduct.average / stats.total) * 100).toFixed(1)}%`],
      ['Yếu', stats.conduct.poor, `${((stats.conduct.poor / stats.total) * 100).toFixed(1)}%`],
    ]

    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 20,
      head: [['Xếp loại', 'Số lượng', 'Tỷ lệ']],
      body: conductData,
      theme: 'grid',
      headStyles: { fillColor: [14, 165, 233] }, // sky-600
    })

    const filename = `ThongKe_${classInfo.name}_${new Date().toISOString().split('T')[0]}.pdf`
    doc.save(filename)

    return { success: true, filename }
  },

  /**
   * Download Excel template for bulk import
   */
  downloadStudentTemplate() {
    const worksheet_data = [
      // Instructions
      ['HỆ THỐNG HAPPYCLASS - TEMPLATE IMPORT HỌC SINH'],
      ['Hướng dẫn: Điền thông tin học sinh vào các dòng bên dưới, không xóa dòng tiêu đề'],
      ['Lưu ý: Mã học sinh không được trùng, các trường có dấu * là bắt buộc'],
      [],
      // Header row
      ['Mã HS *', 'Họ và tên *', 'Giới tính *', 'Ngày sinh', 'Số điện thoại', 'Email', 'Địa chỉ', 'Học lực', 'Hạnh kiểm', 'Ghi chú'],
      // Sample data
      ['HS001', 'Nguyễn Văn An', 'Nam', '2015-05-15', '0901234567', 'nva@email.com', '123 Đường ABC, Q1, TP.HCM', 'Giỏi', 'Tốt', 'Học sinh giỏi'],
      ['HS002', 'Trần Thị Bình', 'Nữ', '2015-03-20', '0901234568', 'ttb@email.com', '456 Đường XYZ, Q2, TP.HCM', 'Khá', 'Khá', 'Học sinh tích cực'],
      [],
      ['GIỚI TÍNH: Nam / Nữ'],
      ['HỌC LỰC: Giỏi / Khá / Trung bình / Yếu'],
      ['HẠNH KIỂM: Tốt / Khá / Trung bình / Yếu'],
    ]

    const ws = XLSX.utils.aoa_to_sheet(worksheet_data)

    // Style for instructions (merge cells)
    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 9 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 9 } },
      { s: { r: 2, c: 0 }, e: { r: 2, c: 9 } },
    ]

    // Set column widths
    ws['!cols'] = [
      { wch: 10 }, // Mã HS
      { wch: 20 }, // Họ tên
      { wch: 10 }, // Giới tính
      { wch: 12 }, // Ngày sinh
      { wch: 15 }, // SĐT
      { wch: 25 }, // Email
      { wch: 30 }, // Địa chỉ
      { wch: 12 }, // Học lực
      { wch: 12 }, // Hạnh kiểm
      { wch: 30 }, // Ghi chú
    ]

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Template')

    const filename = `Template_Import_HocSinh.xlsx`
    XLSX.writeFile(wb, filename)

    return { success: true, filename }
  },

  /**
   * Parse Excel file for bulk import
   */
  parseStudentExcel(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result)
          const workbook = XLSX.read(data, { type: 'array' })
          const worksheet = workbook.Sheets[workbook.SheetNames[0]]
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

          // Find header row (skip instruction rows)
          let headerRowIndex = -1
          for (let i = 0; i < jsonData.length; i++) {
            if (jsonData[i][0] === 'Mã HS *' || jsonData[i][0]?.includes('Mã HS')) {
              headerRowIndex = i
              break
            }
          }

          if (headerRowIndex === -1) {
            reject(new Error('Không tìm thấy dòng tiêu đề trong file Excel'))
            return
          }

          // Parse students (skip header and instruction rows)
          const students = []
          for (let i = headerRowIndex + 1; i < jsonData.length; i++) {
            const row = jsonData[i]
            
            // Skip empty rows or instruction rows
            if (!row[0] || typeof row[0] !== 'string' || row[0].includes('GIỚI TÍNH')) {
              continue
            }

            const student = {
              studentCode: row[0]?.toString().trim() || '',
              fullName: row[1]?.toString().trim() || '',
              gender: this._parseGender(row[2]),
              dateOfBirth: this._parseDate(row[3]),
              phone: row[4]?.toString().trim() || '',
              email: row[5]?.toString().trim() || '',
              address: row[6]?.toString().trim() || '',
              academicPerformance: this._parsePerformance(row[7]),
              conduct: this._parseConduct(row[8]),
              notes: row[9]?.toString().trim() || '',
            }

            // Validate required fields
            if (!student.studentCode || !student.fullName) {
              continue // Skip invalid rows
            }

            students.push(student)
          }

          resolve(students)
        } catch (error) {
          reject(new Error(`Lỗi đọc file Excel: ${error.message}`))
        }
      }

      reader.onerror = () => {
        reject(new Error('Lỗi đọc file'))
      }

      reader.readAsArrayBuffer(file)
    })
  },

  // Helper functions
  _translatePerformance(perf) {
    const map = {
      excellent: 'Giỏi',
      good: 'Khá',
      average: 'Trung bình',
      'below-average': 'Yếu',
    }
    return map[perf] || 'Trung bình'
  },

  _translateConduct(conduct) {
    const map = {
      excellent: 'Tốt',
      good: 'Khá',
      average: 'Trung bình',
      poor: 'Yếu',
    }
    return map[conduct] || 'Khá'
  },

  _translateRelationship(rel) {
    const map = {
      father: 'Bố',
      mother: 'Mẹ',
      grandfather: 'Ông',
      grandmother: 'Bà',
      other: 'Khác',
    }
    return map[rel] || 'Khác'
  },

  _parseGender(value) {
    if (!value) return 'male'
    const str = value.toString().toLowerCase().trim()
    return str.includes('nữ') || str.includes('female') ? 'female' : 'male'
  },

  _parseDate(value) {
    if (!value) return ''
    
    // If already in correct format
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return value
    }

    // Try to parse Excel date
    try {
      const date = new Date(value)
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0]
      }
    } catch (e) {
      // ignore
    }

    return value.toString()
  },

  _parsePerformance(value) {
    if (!value) return 'average'
    const str = value.toString().toLowerCase().trim()
    if (str.includes('giỏi') || str.includes('excellent')) return 'excellent'
    if (str.includes('khá') || str.includes('good')) return 'good'
    if (str.includes('yếu') || str.includes('below')) return 'below-average'
    return 'average'
  },

  _parseConduct(value) {
    if (!value) return 'good'
    const str = value.toString().toLowerCase().trim()
    if (str.includes('tốt') || str.includes('excellent')) return 'excellent'
    if (str.includes('khá') || str.includes('good')) return 'good'
    if (str.includes('yếu') || str.includes('poor')) return 'poor'
    return 'average'
  },
}
