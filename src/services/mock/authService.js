const USERS = [
  {
    id: 'stu_5A_1',
    username: 'hs1',
    password: '123',
    role: 'STUDENT',
    name: 'Nguyen Van A',
    points: 150,
  },
  {
    id: 'tea_1',
    username: 'gv1',
    password: '123',
    role: 'TEACHER',
    name: 'Co Nguyen Thu Hoa',
  },
  {
    id: 'par_1',
    username: 'ph1',
    password: '123',
    role: 'PARENT',
    name: 'Phụ huynh bé Nam',
    childId: 'stu_5A_1',
  },
]

function delay(ms = 500) {
  return new Promise((res) => window.setTimeout(res, ms))
}

export const authService = {
  async login({ username, password }) {
    await delay(500)
    const found = USERS.find((u) => u.username === username && u.password === password)
    if (!found) {
      const err = new Error('Sai tài khoản hoặc mật khẩu')
      err.code = 'INVALID_CREDENTIALS'
      throw err
    }

    // Return a "session-safe" user (no password)
    // In real backend: you would receive JWT/session token here.
    // For now: return a basic user profile.
    const { password: _pw, ...safe } = found
    return safe
  },

  async logout() {
    await delay(500)
    return true
  },
}
