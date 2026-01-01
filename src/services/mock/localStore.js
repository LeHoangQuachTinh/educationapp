// Tiny localStorage JSON helper (best-effort).
// Keep all persistence local-only for prototype realism.

export function readJson(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

export function writeJson(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // ignore
  }
}

export function patchJson(key, patch, fallback = {}) {
  const prev = readJson(key, fallback)
  const next = { ...prev, ...patch }
  writeJson(key, next)
  return next
}

export function todayKey(d = new Date()) {
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}
