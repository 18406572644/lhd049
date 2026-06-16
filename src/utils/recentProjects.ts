import type { Project } from '@/types'

const RECENT_KEY = 'recent_projects'
const MAX_RECENT = 5

export interface RecentProject {
  id: string
  name: string
  category: string
  thumbnail?: string
  updatedAt: string
  path?: string
}

export function getRecentProjects(): RecentProject[] {
  try {
    const data = localStorage.getItem(RECENT_KEY)
    if (!data) return []
    return JSON.parse(data)
  } catch {
    return []
  }
}

export function addRecentProject(project: RecentProject): void {
  try {
    const recent = getRecentProjects()
    const filtered = recent.filter(p => p.id !== project.id)
    filtered.unshift(project)
    const trimmed = filtered.slice(0, MAX_RECENT)
    localStorage.setItem(RECENT_KEY, JSON.stringify(trimmed))
  } catch (e) {
    console.error('Failed to save recent projects:', e)
  }
}

export function removeRecentProject(projectId: string): void {
  try {
    const recent = getRecentProjects()
    const filtered = recent.filter(p => p.id !== projectId)
    localStorage.setItem(RECENT_KEY, JSON.stringify(filtered))
  } catch (e) {
    console.error('Failed to remove recent project:', e)
  }
}

export function clearRecentProjects(): void {
  try {
    localStorage.removeItem(RECENT_KEY)
  } catch (e) {
    console.error('Failed to clear recent projects:', e)
  }
}

export function projectToRecent(project: Project, path?: string): RecentProject {
  return {
    id: project.id,
    name: project.name,
    category: project.category,
    thumbnail: project.thumbnail,
    updatedAt: project.updatedAt,
    path,
  }
}
