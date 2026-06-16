import { invoke } from '@tauri-apps/api'
import { dialog, fs, path } from '@tauri-apps/api'
import type { Project, TapeAsset, ProjectData } from '@/types'
import { v4 as uuidv4 } from 'uuid'

export async function saveProjectDialog(projectData: ProjectData, name: string, category: string, existingId?: string, thumbnail?: string): Promise<{ project: Project; path: string } | null> {
  try {
    const appDir = await path.appDataDir()
    const projectsDir = await path.join(appDir, 'projects')
    
    try {
      await fs.createDir(projectsDir, { recursive: true })
    } catch {}

    const project: Project = {
      id: existingId || uuidv4(),
      name,
      category,
      thumbnail,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      data: projectData,
    }

    const defaultPath = await path.join(projectsDir, `${project.id}.json`)
    
    const savePath = await dialog.save({
      title: '保存排版方案',
      defaultPath,
      filters: [{
        name: 'Washi Tape Project',
        extensions: ['json']
      }]
    })

    if (!savePath) return null

    await invoke('save_project', {
      path: savePath,
      project
    })

    return { project, path: savePath }
  } catch (error) {
    console.error('Failed to save project:', error)
    return null
  }
}

export async function openProjectDialog(): Promise<{ project: Project; path: string } | null> {
  try {
    const selected = await dialog.open({
      title: '打开排版方案',
      multiple: false,
      filters: [{
        name: 'Washi Tape Project',
        extensions: ['json']
      }]
    })

    if (!selected || typeof selected !== 'string') return null

    const project = await invoke<Project>('load_project', {
      path: selected
    })

    return { project, path: selected }
  } catch (error) {
    console.error('Failed to open project:', error)
    return null
  }
}

export async function loadProjectByPath(path: string): Promise<{ project: Project; path: string } | null> {
  try {
    const project = await invoke<Project>('load_project', {
      path
    })

    return { project, path }
  } catch (error) {
    console.error('Failed to load project by path:', error)
    return null
  }
}

export async function listProjects(): Promise<Project[]> {
  try {
    const appDir = await path.appDataDir()
    const projectsDir = await path.join(appDir, 'projects')
    
    try {
      await fs.createDir(projectsDir, { recursive: true })
    } catch {}

    return await invoke<Project[]>('list_projects', {
      dirPath: projectsDir
    })
  } catch (error) {
    console.error('Failed to list projects:', error)
    return []
  }
}

export async function importTapeDialog(): Promise<TapeAsset | null> {
  try {
    const selected = await dialog.open({
      title: '导入胶带素材',
      multiple: false,
      filters: [{
        name: 'Images',
        extensions: ['png', 'jpg', 'jpeg', 'gif', 'webp']
      }]
    })

    if (!selected || typeof selected !== 'string') return null

    const binaryData = await fs.readBinaryFile(selected)
    
    const blob = new Blob([binaryData], { type: 'image/png' })
    const base64 = await new Promise<string>((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.readAsDataURL(blob)
    })

    const img = new Image()
    return await new Promise<TapeAsset | null>((resolve) => {
      img.onload = () => {
        const appDir = path.appDataDir().then(async (dir) => {
          const tapesDir = await path.join(dir, 'tapes')
          try {
            await fs.createDir(tapesDir, { recursive: true })
          } catch {}

          const tape: TapeAsset = {
            id: uuidv4(),
            name: selected.split(/[/\\]/).pop()?.replace(/\.[^/.]+$/, '') || '未命名胶带',
            data: base64,
            width: img.width,
            height: img.height,
            createdAt: new Date().toISOString(),
          }

          await invoke('save_tape', {
            dirPath: tapesDir,
            tape
          })

          resolve(tape)
        })
      }
      img.onerror = () => resolve(null)
      img.src = base64
    })
  } catch (error) {
    console.error('Failed to import tape:', error)
    return null
  }
}

export async function loadTapes(): Promise<TapeAsset[]> {
  try {
    const appDir = await path.appDataDir()
    const tapesDir = await path.join(appDir, 'tapes')
    
    try {
      await fs.createDir(tapesDir, { recursive: true })
    } catch {}

    return await invoke<TapeAsset[]>('list_tapes', {
      dirPath: tapesDir
    })
  } catch (error) {
    console.error('Failed to load tapes:', error)
    return []
  }
}

export async function deleteTape(tapeId: string): Promise<boolean> {
  try {
    const appDir = await path.appDataDir()
    const tapesDir = await path.join(appDir, 'tapes')
    const tapePath = await path.join(tapesDir, `${tapeId}.json`)
    
    await invoke('delete_tape', {
      path: tapePath
    })
    
    return true
  } catch (error) {
    console.error('Failed to delete tape:', error)
    return false
  }
}

export async function exportImageDialog(canvasElement: HTMLElement | null): Promise<string | null> {
  if (!canvasElement) return null

  try {
    const html2canvas = (await import('html2canvas')).default
    
    const canvas = await html2canvas(canvasElement, {
      backgroundColor: null,
      scale: 2,
      useCORS: true,
      logging: false,
    })

    const dataUrl = canvas.toDataURL('image/png')

    const defaultPath = await path.join(await path.desktopDir(), '手账排版.png')
    
    const savePath = await dialog.save({
      title: '导出成品图',
      defaultPath,
      filters: [{
        name: 'PNG Image',
        extensions: ['png']
      }]
    })

    if (!savePath) return null

    await invoke('export_image', {
      path: savePath,
      data: dataUrl
    })

    return savePath
  } catch (error) {
    console.error('Failed to export image:', error)
    return null
  }
}

export async function exportProjectData(projectData: ProjectData, name: string): Promise<string | null> {
  try {
    const exportData = {
      name,
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
      data: projectData,
    }

    const jsonStr = JSON.stringify(exportData, null, 2)

    if (isTauri()) {
      const defaultPath = await path.join(await path.desktopDir(), `${name}.json`)
      
      const savePath = await dialog.save({
        title: '导出画板数据',
        defaultPath,
        filters: [{
          name: 'JSON Data',
          extensions: ['json']
        }]
      })

      if (!savePath) return null

      await fs.writeTextFile(savePath, jsonStr)

      return savePath
    } else {
      const blob = new Blob([jsonStr], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${name}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      return name
    }
  } catch (error) {
    console.error('Failed to export project data:', error)
    return null
  }
}

export function isTauri(): boolean {
  return typeof window !== 'undefined' && window.__TAURI__ !== undefined
}
