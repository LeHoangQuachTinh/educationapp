function delay(ms = 500) {
  return new Promise((res) => window.setTimeout(res, ms))
}

function keyOf({ classId, week, dayIndex, slotIndex }) {
  return `${classId}_${week}_${dayIndex}_${slotIndex}`
}

// In-memory logbook DB per class/week/slot
const db = {
  entries: new Map(),
}

export const logbookService = {
  async getEntry({ classId, week, dayIndex, slotIndex }) {
    await delay(500)
    const key = keyOf({ classId, week, dayIndex, slotIndex })
    return db.entries.get(key) || null
  },

  async saveEntry({ classId, week, dayIndex, slotIndex, entry }) {
    await delay(500)
    const key = keyOf({ classId, week, dayIndex, slotIndex })

    const next = {
      status: entry.status || 'draft',
      rating: entry.rating ?? 4,
      absentees: entry.absentees || [],
      teacherNotes: entry.teacherNotes || '',
      signedBy: entry.signedBy || null,
      submittedAt: entry.submittedAt || null,
      updatedAt: Date.now(),
    }

    db.entries.set(key, next)
    return next
  },

  async signAndSubmit({ classId, week, dayIndex, slotIndex, entry, signedBy = 'Giáo viên' }) {
    await delay(500)
    return this.saveEntry({
      classId,
      week,
      dayIndex,
      slotIndex,
      entry: {
        ...entry,
        status: 'completed',
        signedBy,
        submittedAt: Date.now(),
      },
    })
  },
}
