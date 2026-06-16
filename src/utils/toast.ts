import { writable } from 'svelte/store'

export interface Toast {
  id: number
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
}

export const toasts = writable<Toast[]>([])
let toastId = 0

export function useToast() {
  function showToast(message: string, type: Toast['type'] = 'info', duration = 3000) {
    const id = ++toastId
    toasts.update(t => [...t, { id, message, type }])
    
    setTimeout(() => {
      toasts.update(t => t.filter(toast => toast.id !== id))
    }, duration)
  }

  return { showToast, toasts }
}

export function getIcon(type: Toast['type']): string {
  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
    warning: '⚠',
  }
  return icons[type]
}

export function getBgColor(type: Toast['type']): string {
  const colors = {
    success: 'var(--macaron-green)',
    error: 'var(--macaron-pink)',
    info: 'var(--macaron-blue)',
    warning: 'var(--macaron-yellow)',
  }
  return colors[type]
}
