import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Users, MapPin, TrendingUp, Settings, Eye, Edit2, Trash2 } from 'lucide-react'

import PageHeader from '../../components/common/PageHeader'
import Badge from '../../components/common/Badge'
import Modal from '../../components/common/Modal'
import SoftButton from '../../components/common/SoftButton'
import { useAuth } from '../../context/AuthContext'
import { classManagementService } from '../../services/mock/classManagementService'
import { useToast } from '../../components/common/ToastContext'

const colorOptions = [
  { value: 'sky', label: 'Xanh dương', bg: 'bg-sky-100', text: 'text-sky-700' },
  { value: 'emerald', label: 'Xanh lá', bg: 'bg-emerald-100', text: 'text-emerald-700' },
  { value: 'amber', label: 'Vàng', bg: 'bg-amber-100', text: 'text-amber-700' },
  { value: 'rose', label: 'Hồng', bg: 'bg-rose-100', text: 'text-rose-700' },
  { value: 'purple', label: 'Tím', bg: 'bg-purple-100', text: 'text-purple-700' },
  { value: 'indigo', label: 'Chàm', bg: 'bg-indigo-100', text: 'text-indigo-700' },
]

const iconOptions = ['📚', '🎯', '🌟', '🚀', '💡', '🎨', '🎭', '🎪', '🎬', '🎮', '🏆', '⚡']

export default function ClassManagement() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { showToast } = useToast()

  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editingClass, setEditingClass] = useState(null)

  useEffect(() => {
    loadClasses()
  }, [user])

  async function loadClasses() {
    setLoading(true)
    try {
      const data = await classManagementService.getClasses(user?.username || 'gv1')
      setClasses(data)
    } catch (e) {
      showToast({ title: 'Lỗi', message: e.message, tone: 'rose' })
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(classId, className) {
    if (!confirm(`Xóa lớp ${className}? Hành động này không thể hoàn tác.`)) return

    try {
      await classManagementService.deleteClass(classId)
      showToast({ title: 'Thành công', message: 'Đã xóa lớp học', tone: 'emerald' })
      await loadClasses()
    } catch (e) {
      showToast({ title: 'Lỗi', message: e.message, tone: 'rose' })
    }
  }

  function getColorClasses(color) {
    const option = colorOptions.find((o) => o.value === color) || colorOptions[0]
    return option
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Quản lý lớp học"
        subtitle="Quản lý thông tin lớp, học sinh, phụ huynh và sơ đồ chỗ ngồi"
        right={
          <button
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-2xl bg-sky-600 px-4 py-2 text-sm font-extrabold text-white hover:bg-sky-700"
          >
            <Plus className="h-4 w-4" /> Thêm lớp mới
          </button>
        }
      />

      {loading ? (
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-card">
          <div className="text-sm font-semibold">Đang tải...</div>
        </div>
      ) : classes.length === 0 ? (
        <div className="rounded-3xl border border-slate-100 bg-white p-12 text-center shadow-card">
          <div className="text-6xl">🏫</div>
          <div className="mt-4 text-lg font-extrabold text-slate-900">Chưa có lớp học</div>
          <div className="mt-2 text-sm text-slate-600">
            Thêm lớp học đầu tiên để bắt đầu quản lý
          </div>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-sky-600 px-6 py-3 text-sm font-extrabold text-white hover:bg-sky-700"
          >
            <Plus className="h-5 w-5" /> Thêm lớp mới
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {classes.map((cls) => {
            const colorClass = getColorClasses(cls.color)
            return (
              <div
                key={cls.id}
                className="group rounded-3xl border border-slate-100 bg-white p-5 shadow-card transition hover:shadow-lg"
              >
                <div className="flex items-start justify-between">
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl text-3xl ${colorClass.bg}`}
                  >
                    {cls.icon}
                  </div>

                  <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
                    <button
                      onClick={() => navigate(`/teacher/class/${cls.id}`)}
                      className="rounded-xl bg-sky-50 p-2 text-sky-600 hover:bg-sky-100"
                      title="Xem chi tiết"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setEditingClass(cls)}
                      className="rounded-xl bg-amber-50 p-2 text-amber-600 hover:bg-amber-100"
                      title="Chỉnh sửa"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(cls.id, cls.name)}
                      className="rounded-xl bg-rose-50 p-2 text-rose-600 hover:bg-rose-100"
                      title="Xóa"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="text-xl font-extrabold text-slate-900">{cls.name}</div>
                  <div className="mt-1 text-sm text-slate-600">{cls.description || 'Không có mô tả'}</div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <Badge tone="slate">
                    <MapPin className="mr-1 inline h-3 w-3" />
                    {cls.room || 'Chưa có phòng'}
                  </Badge>
                  <Badge tone="emerald">
                    <Users className="mr-1 inline h-3 w-3" />
                    {cls.studentCount}/{cls.capacity} HS
                  </Badge>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => navigate(`/teacher/class/${cls.id}`)}
                    className="rounded-2xl bg-sky-50 px-4 py-2 text-xs font-semibold text-sky-700 hover:bg-sky-100"
                  >
                    <Eye className="mr-1 inline h-3.5 w-3.5" />
                    Chi tiết
                  </button>
                  <button
                    onClick={() => navigate(`/teacher/class/${cls.id}/seating`)}
                    className="rounded-2xl bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                  >
                    <MapPin className="mr-1 inline h-3.5 w-3.5" />
                    Chỗ ngồi
                  </button>
                </div>

                <div className="mt-3 border-t border-slate-100 pt-3 text-xs text-slate-500">
                  Năm học: {cls.schoolYear} • Khối {cls.grade}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {createModalOpen && (
        <ClassFormModal
          onClose={() => setCreateModalOpen(false)}
          teacherId={user?.username || 'gv1'}
          onSuccess={() => {
            loadClasses()
            setCreateModalOpen(false)
          }}
        />
      )}

      {editingClass && (
        <ClassFormModal
          classData={editingClass}
          onClose={() => setEditingClass(null)}
          teacherId={user?.username || 'gv1'}
          onSuccess={() => {
            loadClasses()
            setEditingClass(null)
          }}
        />
      )}
    </div>
  )
}

function ClassFormModal({ classData, onClose, teacherId, onSuccess }) {
  const { showToast } = useToast()
  const isEdit = !!classData

  const [saving, setSaving] = useState(false)
  const [name, setName] = useState(classData?.name || '')
  const [grade, setGrade] = useState(classData?.grade || 5)
  const [schoolYear, setSchoolYear] = useState(classData?.schoolYear || '2025-2026')
  const [capacity, setCapacity] = useState(classData?.capacity || 40)
  const [room, setRoom] = useState(classData?.room || '')
  const [description, setDescription] = useState(classData?.description || '')
  const [color, setColor] = useState(classData?.color || 'sky')
  const [icon, setIcon] = useState(classData?.icon || '📚')

  async function handleSubmit() {
    if (!name.trim()) {
      showToast({ title: 'Thiếu thông tin', message: 'Vui lòng nhập tên lớp', tone: 'rose' })
      return
    }

    setSaving(true)
    try {
      if (isEdit) {
        await classManagementService.updateClass(classData.id, {
          name: name.trim(),
          grade: Number(grade),
          schoolYear,
          capacity: Number(capacity),
          room: room.trim(),
          description: description.trim(),
          color,
          icon,
        })
        showToast({ title: 'Thành công', message: 'Đã cập nhật lớp học', tone: 'emerald' })
      } else {
        await classManagementService.createClass({
          name: name.trim(),
          grade: Number(grade),
          schoolYear,
          homeRoomTeacher: teacherId,
          capacity: Number(capacity),
          room: room.trim(),
          description: description.trim(),
          color,
          icon,
        })
        showToast({ title: 'Thành công', message: 'Đã tạo lớp học mới', tone: 'emerald' })
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
      title={isEdit ? 'Chỉnh sửa lớp học' : 'Thêm lớp học mới'}
      footer={
        <div className="flex items-center justify-end gap-2">
          <SoftButton onClick={onClose}>Hủy</SoftButton>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="rounded-2xl bg-sky-600 px-4 py-2 text-sm font-extrabold text-white disabled:opacity-50"
          >
            {saving ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Tạo lớp'}
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-xs font-semibold text-slate-600">Tên lớp *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: 5A"
              className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600">Khối</label>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="1">Khối 1</option>
              <option value="2">Khối 2</option>
              <option value="3">Khối 3</option>
              <option value="4">Khối 4</option>
              <option value="5">Khối 5</option>
            </select>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-xs font-semibold text-slate-600">Năm học</label>
            <input
              value={schoolYear}
              onChange={(e) => setSchoolYear(e.target.value)}
              placeholder="2025-2026"
              className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600">Sĩ số tối đa</label>
            <input
              type="number"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              min="1"
              max="100"
              className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-600">Phòng học</label>
          <input
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            placeholder="VD: A101"
            className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-600">Mô tả</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="Mô tả về lớp học..."
            className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-600">Màu sắc</label>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {colorOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setColor(opt.value)}
                className={`rounded-2xl border-2 px-3 py-2 text-sm font-semibold transition ${
                  color === opt.value
                    ? `border-${opt.value}-400 ${opt.bg} ${opt.text}`
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-600">Icon</label>
          <div className="mt-2 grid grid-cols-6 gap-2">
            {iconOptions.map((ico) => (
              <button
                key={ico}
                onClick={() => setIcon(ico)}
                className={`rounded-2xl border-2 p-3 text-2xl transition ${
                  icon === ico
                    ? 'border-sky-400 bg-sky-50'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                }`}
              >
                {ico}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  )
}
