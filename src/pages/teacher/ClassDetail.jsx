import React, { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Users, UserPlus, Edit2, Trash2, Phone, Mail, MapPin, Download, Upload, FileSpreadsheet, FileText } from 'lucide-react'

import PageHeader from '../../components/common/PageHeader'
import Badge from '../../components/common/Badge'
import Tabs from '../../components/common/Tabs'
import Modal from '../../components/common/Modal'
import SoftButton from '../../components/common/SoftButton'
import { classManagementService } from '../../services/mock/classManagementService'
import { exportService } from '../../services/exportService'
import { useToast } from '../../components/common/ToastContext'

export default function ClassDetail() {
  const { classId } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [classData, setClassData] = useState(null)
  const [students, setStudents] = useState([])
  const [parents, setParents] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('students')

  const [addStudentModalOpen, setAddStudentModalOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState(null)
  const [addParentModalOpen, setAddParentModalOpen] = useState(false)
  const [importModalOpen, setImportModalOpen] = useState(false)

  useEffect(() => {
    loadData()
  }, [classId])

  async function loadData() {
    setLoading(true)
    try {
      const [cls, studs, pars, statistics] = await Promise.all([
        classManagementService.getClass(classId),
        classManagementService.getStudents(classId),
        classManagementService.getParents({ classId }),
        classManagementService.getClassStats(classId),
      ])
      setClassData(cls)
      setStudents(studs)
      setParents(pars)
      setStats(statistics)
    } catch (e) {
      showToast({ title: 'Lỗi', message: e.message, tone: 'rose' })
    } finally {
      setLoading(false)
    }
  }

  async function handleDeleteStudent(studentId, studentName) {
    if (!confirm(`Xóa học sinh ${studentName}?`)) return

    try {
      await classManagementService.deleteStudent(studentId)
      showToast({ title: 'Thành công', message: 'Đã xóa học sinh', tone: 'emerald' })
      await loadData()
    } catch (e) {
      showToast({ title: 'Lỗi', message: e.message, tone: 'rose' })
    }
  }

  async function handleDeleteParent(parentId, parentName) {
    if (!confirm(`Xóa phụ huynh ${parentName}?`)) return

    try {
      await classManagementService.deleteParent(parentId)
      showToast({ title: 'Thành công', message: 'Đã xóa phụ huynh', tone: 'emerald' })
      await loadData()
    } catch (e) {
      showToast({ title: 'Lỗi', message: e.message, tone: 'rose' })
    }
  }

  function handleExportStudentsExcel() {
    try {
      exportService.exportStudentsToExcel(students, classData.name)
      showToast({ title: 'Thành công', message: 'Đã xuất file Excel', tone: 'emerald' })
    } catch (e) {
      showToast({ title: 'Lỗi', message: e.message, tone: 'rose' })
    }
  }

  function handleExportStudentsPDF() {
    try {
      exportService.exportStudentsToPDF(students, classData)
      showToast({ title: 'Thành công', message: 'Đã xuất file PDF', tone: 'emerald' })
    } catch (e) {
      showToast({ title: 'Lỗi', message: e.message, tone: 'rose' })
    }
  }

  function handleExportParentsExcel() {
    try {
      exportService.exportParentsToExcel(parents, classData.name)
      showToast({ title: 'Thành công', message: 'Đã xuất file Excel', tone: 'emerald' })
    } catch (e) {
      showToast({ title: 'Lỗi', message: e.message, tone: 'rose' })
    }
  }

  function handleExportStatsPDF() {
    try {
      exportService.exportStatsToPDF(classData, stats)
      showToast({ title: 'Thành công', message: 'Đã xuất báo cáo PDF', tone: 'emerald' })
    } catch (e) {
      showToast({ title: 'Lỗi', message: e.message, tone: 'rose' })
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-card">
          <div className="text-sm font-semibold">Đang tải...</div>
        </div>
      </div>
    )
  }

  if (!classData) {
    return (
      <div className="space-y-4">
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-center shadow-card">
          <div className="text-sm font-semibold text-rose-700">Không tìm thấy lớp học</div>
        </div>
      </div>
    )
  }

  const tabs = [
    { value: 'students', label: `Học sinh (${students.length})` },
    { value: 'parents', label: `Phụ huynh (${parents.length})` },
    { value: 'stats', label: 'Thống kê' },
  ]

  return (
    <div className="space-y-4">
      <PageHeader
        title={classData.name}
        subtitle={`${classData.description || 'Lớp học'} • Phòng ${classData.room || 'N/A'}`}
        right={
          <button
            onClick={() => navigate('/teacher/class-management')}
            className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-extrabold text-white"
          >
            <ArrowLeft className="h-4 w-4" /> Quay lại
          </button>
        }
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-card">
          <div className="text-xs font-semibold text-slate-600">Sĩ số</div>
          <div className="mt-2 text-3xl font-extrabold text-slate-900">
            {stats?.total || 0}/{classData.capacity}
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Nam: {stats?.male || 0} • Nữ: {stats?.female || 0}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-card">
          <div className="text-xs font-semibold text-slate-600">Giỏi</div>
          <div className="mt-2 text-3xl font-extrabold text-emerald-600">
            {stats?.performance.excellent || 0}
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Khá: {stats?.performance.good || 0}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-card">
          <div className="text-xs font-semibold text-slate-600">Hạnh kiểm tốt</div>
          <div className="mt-2 text-3xl font-extrabold text-sky-600">
            {stats?.conduct.good + stats?.conduct.excellent || 0}
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Xuất sắc: {stats?.conduct.excellent || 0}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-card">
          <div className="text-xs font-semibold text-slate-600">Điểm TB</div>
          <div className="mt-2 text-3xl font-extrabold text-amber-600">
            {stats?.averagePoints || 0}
          </div>
          <div className="mt-2 text-xs text-slate-500">Điểm thưởng trung bình</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="rounded-3xl border border-slate-100 bg-white shadow-card">
        <div className="border-b border-slate-100 px-6 py-4">
          <Tabs value={activeTab} onChange={setActiveTab} items={tabs} />
        </div>

        <div className="p-6">
          {activeTab === 'students' && (
            <StudentsTab
              students={students}
              classId={classId}
              onAdd={() => setAddStudentModalOpen(true)}
              onEdit={setEditingStudent}
              onDelete={handleDeleteStudent}
              onImport={() => setImportModalOpen(true)}
              onExportExcel={handleExportStudentsExcel}
              onExportPDF={handleExportStudentsPDF}
            />
          )}

          {activeTab === 'parents' && (
            <ParentsTab
              parents={parents}
              onAdd={() => setAddParentModalOpen(true)}
              onDelete={handleDeleteParent}
              onExportExcel={handleExportParentsExcel}
            />
          )}

          {activeTab === 'stats' && <StatsTab stats={stats} onExportPDF={handleExportStatsPDF} />}
        </div>
      </div>

      {addStudentModalOpen && (
        <StudentFormModal
          classId={classId}
          onClose={() => setAddStudentModalOpen(false)}
          onSuccess={() => {
            loadData()
            setAddStudentModalOpen(false)
          }}
        />
      )}

      {editingStudent && (
        <StudentFormModal
          classId={classId}
          studentData={editingStudent}
          onClose={() => setEditingStudent(null)}
          onSuccess={() => {
            loadData()
            setEditingStudent(null)
          }}
        />
      )}

      {addParentModalOpen && (
        <ParentFormModal
          classId={classId}
          students={students}
          onClose={() => setAddParentModalOpen(false)}
          onSuccess={() => {
            loadData()
            setAddParentModalOpen(false)
          }}
        />
      )}

      {importModalOpen && (
        <ImportStudentsModal
          classId={classId}
          onClose={() => setImportModalOpen(false)}
          onSuccess={() => {
            loadData()
            setImportModalOpen(false)
          }}
        />
      )}
    </div>
  )
}

function StudentsTab({ students, classId, onAdd, onEdit, onDelete, onImport, onExportExcel, onExportPDF }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-extrabold text-slate-900">
          Danh sách học sinh ({students.length})
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onImport}
            className="inline-flex items-center gap-2 rounded-2xl bg-amber-600 px-4 py-2 text-sm font-extrabold text-white hover:bg-amber-700"
          >
            <Upload className="h-4 w-4" /> Import Excel
          </button>
          <button
            onClick={onExportExcel}
            className="inline-flex items-center gap-2 rounded-2xl bg-sky-600 px-4 py-2 text-sm font-extrabold text-white hover:bg-sky-700"
          >
            <FileSpreadsheet className="h-4 w-4" /> Excel
          </button>
          <button
            onClick={onExportPDF}
            className="inline-flex items-center gap-2 rounded-2xl bg-rose-600 px-4 py-2 text-sm font-extrabold text-white hover:bg-rose-700"
          >
            <FileText className="h-4 w-4" /> PDF
          </button>
          <button
            onClick={onAdd}
            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-extrabold text-white hover:bg-emerald-700"
          >
            <UserPlus className="h-4 w-4" /> Thêm
          </button>
        </div>
      </div>

      {students.length === 0 ? (
        <div className="rounded-2xl bg-slate-50 p-8 text-center">
          <div className="text-4xl">👥</div>
          <div className="mt-3 text-sm font-semibold text-slate-900">Chưa có học sinh</div>
          <div className="mt-1 text-sm text-slate-600">Thêm học sinh đầu tiên vào lớp</div>
        </div>
      ) : (
        <div className="space-y-3">
          {students.map((student) => (
            <div
              key={student.id}
              className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-xl font-extrabold text-sky-700">
                  {student.fullName.charAt(0)}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-extrabold text-slate-900">{student.fullName}</div>
                    <Badge tone={student.gender === 'male' ? 'sky' : 'rose'}>
                      {student.gender === 'male' ? 'Nam' : 'Nữ'}
                    </Badge>
                    {student.academicPerformance === 'excellent' && (
                      <Badge tone="emerald">Giỏi</Badge>
                    )}
                  </div>

                  <div className="mt-1 text-xs text-slate-600">
                    Mã: {student.studentCode} • Sinh: {student.dateOfBirth}
                  </div>

                  {student.parents && student.parents.length > 0 && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-slate-500">
                      <Phone className="h-3 w-3" />
                      {student.parents[0].phone}
                    </div>
                  )}

                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge tone="amber">💰 {student.currentPoints} điểm</Badge>
                    {student.seatNumber > 0 && (
                      <Badge tone="slate">
                        <MapPin className="mr-1 inline h-3 w-3" />
                        Chỗ ngồi {student.seatNumber}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => onEdit(student)}
                  className="rounded-xl bg-amber-50 p-2 text-amber-600 hover:bg-amber-100"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onDelete(student.id, student.fullName)}
                  className="rounded-xl bg-rose-50 p-2 text-rose-600 hover:bg-rose-100"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ParentsTab({ parents, onAdd, onDelete, onExportExcel }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-extrabold text-slate-900">
          Danh sách phụ huynh ({parents.length})
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onExportExcel}
            className="inline-flex items-center gap-2 rounded-2xl bg-sky-600 px-4 py-2 text-sm font-extrabold text-white hover:bg-sky-700"
          >
            <FileSpreadsheet className="h-4 w-4" /> Export Excel
          </button>
          <button
            onClick={onAdd}
            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-extrabold text-white hover:bg-emerald-700"
          >
            <UserPlus className="h-4 w-4" /> Thêm phụ huynh
          </button>
        </div>
      </div>

      {parents.length === 0 ? (
        <div className="rounded-2xl bg-slate-50 p-8 text-center">
          <div className="text-4xl">👨‍👩‍👧</div>
          <div className="mt-3 text-sm font-semibold text-slate-900">Chưa có phụ huynh</div>
          <div className="mt-1 text-sm text-slate-600">Thêm thông tin phụ huynh</div>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {parents.map((parent) => (
            <div
              key={parent.id}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-extrabold text-slate-900">{parent.fullName}</div>
                    <Badge tone="sky">{parent.relationship}</Badge>
                    {parent.isMainContact && <Badge tone="emerald">Liên hệ chính</Badge>}
                  </div>

                  <div className="mt-2 space-y-1 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Phone className="h-3 w-3" />
                      {parent.phone}
                    </div>
                    {parent.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3" />
                        {parent.email}
                      </div>
                    )}
                    {parent.occupation && (
                      <div className="flex items-center gap-2">
                        <Users className="h-3 w-3" />
                        {parent.occupation}
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => onDelete(parent.id, parent.fullName)}
                  className="rounded-xl bg-rose-50 p-2 text-rose-600 hover:bg-rose-100"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function StatsTab({ stats, onExportPDF }) {
  if (!stats) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-sm font-extrabold text-slate-900">Thống kê lớp học</div>
        <button
          onClick={onExportPDF}
          className="inline-flex items-center gap-2 rounded-2xl bg-rose-600 px-4 py-2 text-sm font-extrabold text-white hover:bg-rose-700"
        >
          <FileText className="h-4 w-4" /> Export PDF
        </button>
      </div>

      <div>
        <div className="text-sm font-extrabold text-slate-900">Học lực</div>
        <div className="mt-3 space-y-2">
          <StatBar label="Giỏi" value={stats.performance.excellent} total={stats.total} color="emerald" />
          <StatBar label="Khá" value={stats.performance.good} total={stats.total} color="sky" />
          <StatBar label="Trung bình" value={stats.performance.average} total={stats.total} color="amber" />
          <StatBar label="Yếu" value={stats.performance.belowAverage} total={stats.total} color="rose" />
        </div>
      </div>

      <div>
        <div className="text-sm font-extrabold text-slate-900">Hạnh kiểm</div>
        <div className="mt-3 space-y-2">
          <StatBar label="Tốt" value={stats.conduct.excellent} total={stats.total} color="emerald" />
          <StatBar label="Khá" value={stats.conduct.good} total={stats.total} color="sky" />
          <StatBar label="Trung bình" value={stats.conduct.average} total={stats.total} color="amber" />
          <StatBar label="Yếu" value={stats.conduct.poor} total={stats.total} color="rose" />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="text-sm font-semibold text-slate-700">Giới tính</div>
        <div className="mt-3 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-sky-600"></div>
            <span className="text-sm text-slate-600">Nam: {stats.male}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-rose-600"></div>
            <span className="text-sm text-slate-600">Nữ: {stats.female}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatBar({ label, value, total, color }) {
  const percentage = total > 0 ? (value / total) * 100 : 0

  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-700">{label}</span>
        <span className="font-semibold text-slate-900">
          {value} ({percentage.toFixed(0)}%)
        </span>
      </div>
      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className={`h-2 bg-${color}-600 transition-all`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

function StudentFormModal({ classId, studentData, onClose, onSuccess }) {
  const { showToast } = useToast()
  const isEdit = !!studentData

  const [saving, setSaving] = useState(false)
  const [studentCode, setStudentCode] = useState(studentData?.studentCode || '')
  const [fullName, setFullName] = useState(studentData?.fullName || '')
  const [gender, setGender] = useState(studentData?.gender || 'male')
  const [dateOfBirth, setDateOfBirth] = useState(studentData?.dateOfBirth || '')
  const [phone, setPhone] = useState(studentData?.phone || '')
  const [email, setEmail] = useState(studentData?.email || '')
  const [address, setAddress] = useState(studentData?.address || '')
  const [academicPerformance, setAcademicPerformance] = useState(
    studentData?.academicPerformance || 'average',
  )
  const [conduct, setConduct] = useState(studentData?.conduct || 'good')
  const [notes, setNotes] = useState(studentData?.notes || '')

  async function handleSubmit() {
    if (!studentCode.trim() || !fullName.trim()) {
      showToast({ title: 'Thiếu thông tin', message: 'Vui lòng điền đầy đủ thông tin', tone: 'rose' })
      return
    }

    setSaving(true)
    try {
      if (isEdit) {
        await classManagementService.updateStudent(studentData.id, {
          studentCode: studentCode.trim(),
          fullName: fullName.trim(),
          gender,
          dateOfBirth,
          phone: phone.trim(),
          email: email.trim(),
          address: address.trim(),
          academicPerformance,
          conduct,
          notes: notes.trim(),
        })
        showToast({ title: 'Thành công', message: 'Đã cập nhật học sinh', tone: 'emerald' })
      } else {
        await classManagementService.addStudent({
          classId,
          studentCode: studentCode.trim(),
          fullName: fullName.trim(),
          gender,
          dateOfBirth,
          phone: phone.trim(),
          email: email.trim(),
          address: address.trim(),
          academicPerformance,
          conduct,
          notes: notes.trim(),
        })
        showToast({ title: 'Thành công', message: 'Đã thêm học sinh', tone: 'emerald' })
      }
      onSuccess()
    } catch (e) {
      showToast({ title: 'Lỗi', message: e.message, tone: 'rose' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={true}
      onClose={onClose}
      title={isEdit ? 'Chỉnh sửa học sinh' : 'Thêm học sinh mới'}
      size="large"
      footer={
        <div className="flex items-center justify-end gap-2">
          <SoftButton onClick={onClose}>Hủy</SoftButton>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-extrabold text-white disabled:opacity-50"
          >
            {saving ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Thêm học sinh'}
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-xs font-semibold text-slate-600">Mã học sinh *</label>
            <input
              value={studentCode}
              onChange={(e) => setStudentCode(e.target.value)}
              placeholder="VD: HS001"
              className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600">Họ và tên *</label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="VD: Nguyễn Văn An"
              className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-xs font-semibold text-slate-600">Giới tính</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600">Ngày sinh</label>
            <input
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-xs font-semibold text-slate-600">Số điện thoại</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0901234567"
              className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-600">Địa chỉ</label>
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="123 Đường ABC, Quận X, TP.HCM"
            className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-xs font-semibold text-slate-600">Học lực</label>
            <select
              value={academicPerformance}
              onChange={(e) => setAcademicPerformance(e.target.value)}
              className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="excellent">Giỏi</option>
              <option value="good">Khá</option>
              <option value="average">Trung bình</option>
              <option value="below-average">Yếu</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600">Hạnh kiểm</label>
            <select
              value={conduct}
              onChange={(e) => setConduct(e.target.value)}
              className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="excellent">Tốt</option>
              <option value="good">Khá</option>
              <option value="average">Trung bình</option>
              <option value="poor">Yếu</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-600">Ghi chú</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Ghi chú về học sinh..."
            className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
          />
        </div>
      </div>
    </Modal>
  )
}

function ParentFormModal({ classId, students, onClose, onSuccess }) {
  const { showToast } = useToast()

  const [saving, setSaving] = useState(false)
  const [fullName, setFullName] = useState('')
  const [relationship, setRelationship] = useState('father')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [occupation, setOccupation] = useState('')
  const [address, setAddress] = useState('')
  const [studentIds, setStudentIds] = useState([])
  const [isMainContact, setIsMainContact] = useState(false)

  async function handleSubmit() {
    if (!fullName.trim() || !phone.trim() || studentIds.length === 0) {
      showToast({
        title: 'Thiếu thông tin',
        message: 'Vui lòng điền đầy đủ thông tin và chọn học sinh',
        tone: 'rose',
      })
      return
    }

    setSaving(true)
    try {
      await classManagementService.addParent({
        fullName: fullName.trim(),
        relationship,
        phone: phone.trim(),
        email: email.trim(),
        occupation: occupation.trim(),
        address: address.trim(),
        studentIds,
        isMainContact,
      })
      showToast({ title: 'Thành công', message: 'Đã thêm phụ huynh', tone: 'emerald' })
      onSuccess()
    } catch (e) {
      showToast({ title: 'Lỗi', message: e.message, tone: 'rose' })
    } finally {
      setSaving(false)
    }
  }

  function toggleStudent(studentId) {
    setStudentIds((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId],
    )
  }

  return (
    <Modal
      open={true}
      onClose={onClose}
      title="Thêm phụ huynh"
      size="large"
      footer={
        <div className="flex items-center justify-end gap-2">
          <SoftButton onClick={onClose}>Hủy</SoftButton>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-extrabold text-white disabled:opacity-50"
          >
            {saving ? 'Đang lưu...' : 'Thêm phụ huynh'}
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-xs font-semibold text-slate-600">Họ và tên *</label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="VD: Nguyễn Văn Cha"
              className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600">Quan hệ</label>
            <select
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
              className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="father">Bố</option>
              <option value="mother">Mẹ</option>
              <option value="grandfather">Ông</option>
              <option value="grandmother">Bà</option>
              <option value="other">Khác</option>
            </select>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-xs font-semibold text-slate-600">Số điện thoại *</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0901234567"
              className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-xs font-semibold text-slate-600">Nghề nghiệp</label>
            <input
              value={occupation}
              onChange={(e) => setOccupation(e.target.value)}
              placeholder="VD: Kỹ sư"
              className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
            />
          </div>

          <div className="flex items-end">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isMainContact}
                onChange={(e) => setIsMainContact(e.target.checked)}
                className="h-4 w-4"
              />
              <span className="text-sm text-slate-700">Liên hệ chính</span>
            </label>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-600">Địa chỉ</label>
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="123 Đường ABC, Quận X, TP.HCM"
            className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-600">Học sinh *</label>
          <div className="mt-2 max-h-48 space-y-2 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 p-3">
            {students.map((student) => (
              <label
                key={student.id}
                className="flex cursor-pointer items-center gap-3 rounded-xl bg-white p-2 hover:bg-sky-50"
              >
                <input
                  type="checkbox"
                  checked={studentIds.includes(student.id)}
                  onChange={() => toggleStudent(student.id)}
                  className="h-4 w-4"
                />
                <span className="text-sm text-slate-900">{student.fullName}</span>
                <span className="text-xs text-slate-500">({student.studentCode})</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  )
}

function ImportStudentsModal({ classId, onClose, onSuccess }) {
  const { showToast } = useToast()
  const fileInputRef = useRef(null)

  const [importing, setImporting] = useState(false)
  const [previewData, setPreviewData] = useState(null)
  const [file, setFile] = useState(null)

  function handleDownloadTemplate() {
    try {
      exportService.downloadStudentTemplate()
      showToast({ title: 'Thành công', message: 'Đã tải template Excel', tone: 'emerald' })
    } catch (e) {
      showToast({ title: 'Lỗi', message: e.message, tone: 'rose' })
    }
  }

  async function handleFileChange(e) {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    if (!selectedFile.name.endsWith('.xlsx') && !selectedFile.name.endsWith('.xls')) {
      showToast({ title: 'Lỗi', message: 'Vui lòng chọn file Excel (.xlsx, .xls)', tone: 'rose' })
      return
    }

    setFile(selectedFile)

    try {
      const students = await exportService.parseStudentExcel(selectedFile)
      setPreviewData(students)
      showToast({ title: 'Thành công', message: `Đã đọc ${students.length} học sinh từ file`, tone: 'emerald' })
    } catch (e) {
      showToast({ title: 'Lỗi', message: e.message, tone: 'rose' })
      setFile(null)
      setPreviewData(null)
    }
  }

  async function handleImport() {
    if (!previewData || previewData.length === 0) {
      showToast({ title: 'Lỗi', message: 'Không có dữ liệu để import', tone: 'rose' })
      return
    }

    setImporting(true)
    try {
      let successCount = 0
      let errorCount = 0
      const errors = []

      for (const student of previewData) {
        try {
          await classManagementService.addStudent({
            ...student,
            classId,
          })
          successCount++
        } catch (e) {
          errorCount++
          errors.push(`${student.studentCode}: ${e.message}`)
        }
      }

      if (successCount > 0) {
        showToast({
          title: 'Hoàn thành',
          message: `Đã import ${successCount} học sinh. Lỗi: ${errorCount}`,
          tone: successCount > errorCount ? 'emerald' : 'amber',
        })
      }

      if (errors.length > 0 && errors.length <= 5) {
        console.error('Import errors:', errors)
      }

      if (successCount > 0) {
        onSuccess()
      }
    } catch (e) {
      showToast({ title: 'Lỗi', message: e.message, tone: 'rose' })
    } finally {
      setImporting(false)
    }
  }

  return (
    <Modal
      open={true}
      onClose={onClose}
      title="Import học sinh từ Excel"
      size="large"
      footer={
        <div className="flex items-center justify-between">
          <button
            onClick={handleDownloadTemplate}
            className="inline-flex items-center gap-2 rounded-2xl bg-amber-600 px-4 py-2 text-sm font-extrabold text-white hover:bg-amber-700"
          >
            <Download className="h-4 w-4" /> Tải Template
          </button>
          <div className="flex items-center gap-2">
            <SoftButton onClick={onClose}>Hủy</SoftButton>
            <button
              onClick={handleImport}
              disabled={importing || !previewData || previewData.length === 0}
              className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-extrabold text-white disabled:opacity-50"
            >
              {importing ? 'Đang import...' : `Import ${previewData?.length || 0} học sinh`}
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center">
          <div className="text-4xl">📄</div>
          <div className="mt-3 text-sm font-semibold text-slate-900">Chọn file Excel</div>
          <div className="mt-1 text-sm text-slate-600">
            Hỗ trợ định dạng .xlsx, .xls
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-sky-600 px-6 py-3 text-sm font-extrabold text-white hover:bg-sky-700"
          >
            <Upload className="h-4 w-4" /> Chọn file
          </button>
          {file && (
            <div className="mt-3 text-sm text-slate-600">
              Đã chọn: <span className="font-semibold">{file.name}</span>
            </div>
          )}
        </div>

        {previewData && previewData.length > 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white">
            <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
              <div className="text-sm font-semibold text-slate-900">
                Xem trước ({previewData.length} học sinh)
              </div>
            </div>
            <div className="max-h-96 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-slate-100">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-slate-700">STT</th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-700">Mã HS</th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-700">Họ tên</th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-700">GT</th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-700">Ngày sinh</th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-700">SĐT</th>
                  </tr>
                </thead>
                <tbody>
                  {previewData.slice(0, 50).map((student, index) => (
                    <tr key={index} className="border-t border-slate-100 hover:bg-slate-50">
                      <td className="px-3 py-2 text-slate-600">{index + 1}</td>
                      <td className="px-3 py-2 font-medium text-slate-900">{student.studentCode}</td>
                      <td className="px-3 py-2 text-slate-900">{student.fullName}</td>
                      <td className="px-3 py-2 text-slate-600">
                        {student.gender === 'male' ? 'Nam' : 'Nữ'}
                      </td>
                      <td className="px-3 py-2 text-slate-600">{student.dateOfBirth}</td>
                      <td className="px-3 py-2 text-slate-600">{student.phone}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {previewData.length > 50 && (
                <div className="border-t border-slate-200 bg-slate-50 px-4 py-2 text-center text-xs text-slate-600">
                  Và {previewData.length - 50} học sinh khác...
                </div>
              )}
            </div>
          </div>
        )}

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-2 text-sm text-amber-800">
            <div className="text-lg">⚠️</div>
            <div>
              <div className="font-semibold">Lưu ý:</div>
              <ul className="mt-2 list-inside list-disc space-y-1">
                <li>Tải template Excel để xem định dạng đúng</li>
                <li>Mã học sinh không được trùng</li>
                <li>Các trường bắt buộc: Mã HS, Họ tên, Giới tính</li>
                <li>Hệ thống sẽ bỏ qua các dòng lỗi và tiếp tục import</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}
