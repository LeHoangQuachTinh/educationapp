import { readJson, writeJson } from './localStore'

const KEY = 'happyclass_rewards_v1'

// Data shape:
// {
//   [studentId]: {
//     inventory: string[]; // item ids
//     purchases: Array<{ id, itemId, itemName, cost, ts }>
//   }
// }

function ensureDb() {
  return readJson(KEY, {})
}

function saveDb(db) {
  writeJson(KEY, db)
}

function uid(prefix = 'rw') {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`
}

export const rewardService = {
  async getWallet(studentId) {
    const db = ensureDb()
    const w = db[studentId] || { inventory: [], purchases: [] }
    return { inventory: [...(w.inventory || [])], purchases: [...(w.purchases || [])] }
  },

  async addPurchase({ studentId, item }) {
    const db = ensureDb()
    const w = db[studentId] || { inventory: [], purchases: [] }

    const purchase = {
      id: uid('buy'),
      itemId: item.id,
      itemName: item.name,
      cost: item.cost,
      ts: Date.now(),
    }

    const next = {
      inventory: [...(w.inventory || []), item.id],
      purchases: [purchase, ...(w.purchases || [])],
    }

    db[studentId] = next
    saveDb(db)

    return { ...purchase }
  },
}
