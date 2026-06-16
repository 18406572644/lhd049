import { writable, derived, get } from 'svelte/store'
import type { TapeAsset } from '@/types'
import { v4 as uuidv4 } from 'uuid'

function createTapeStore() {
  const tapes = writable<TapeAsset[]>([])
  const loading = writable(false)

  const sortedTapes = derived(tapes, ($tapes) => {
    return [...$tapes].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  })

  function addTape(tape: Omit<TapeAsset, 'id' | 'createdAt'>) {
    const newTape: TapeAsset = {
      ...tape,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    }
    tapes.update(t => [...t, newTape])
    return newTape
  }

  function removeTape(id: string) {
    tapes.update(t => t.filter(tape => tape.id !== id))
  }

  function updateTape(id: string, updates: Partial<TapeAsset>) {
    tapes.update(tapes => {
      const index = tapes.findIndex(t => t.id === id)
      if (index !== -1) {
        tapes[index] = { ...tapes[index], ...updates }
      }
      return [...tapes]
    })
  }

  function getTapeById(id: string) {
    return get(tapes).find(t => t.id === id)
  }

  function loadTapes(tapeList: TapeAsset[]) {
    tapes.set(tapeList)
  }

  function clearTapes() {
    tapes.set([])
  }

  return {
    tapes,
    loading,
    sortedTapes,
    addTape,
    removeTape,
    updateTape,
    getTapeById,
    loadTapes,
    clearTapes,
  }
}

export const useTapeStore = createTapeStore
