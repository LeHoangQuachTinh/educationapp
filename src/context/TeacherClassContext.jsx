import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { teacherService } from '../services/mock/teacherService'

const TeacherClassContext = createContext(null)
const STORAGE_KEY = 'happyclass_teacher_currentClassId'

export function TeacherClassProvider({ teacherId, children }) {
  const [classes, setClasses] = useState([])
  const [currentClassId, setCurrentClassId] = useState('5A')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      const list = await teacherService.getTeacherClasses(teacherId)

      let restored = null
      try {
        restored = window.localStorage.getItem(STORAGE_KEY)
      } catch {
        restored = null
      }

      const fallback = list?.[0]?.id || '5A'
      const nextCurrent = restored && list.some((c) => c.id === restored) ? restored : fallback

      if (!mounted) return
      setClasses(list)
      setCurrentClassId(nextCurrent)
      setLoading(false)
    }

    load()
    return () => {
      mounted = false
    }
  }, [teacherId])

  function selectClass(classId) {
    setCurrentClassId(classId)
    try {
      window.localStorage.setItem(STORAGE_KEY, classId)
    } catch {
      // ignore
    }
  }

  const currentClass = useMemo(
    () => classes.find((c) => c.id === currentClassId) || null,
    [classes, currentClassId],
  )

  const value = useMemo(
    () => ({
      loading,
      classes,
      currentClassId,
      currentClass,
      selectClass,
    }),
    [loading, classes, currentClassId, currentClass],
  )

  return <TeacherClassContext.Provider value={value}>{children}</TeacherClassContext.Provider>
}

export function useTeacherClass() {
  const ctx = useContext(TeacherClassContext)
  if (!ctx) throw new Error('useTeacherClass must be used within TeacherClassProvider')
  return ctx
}
