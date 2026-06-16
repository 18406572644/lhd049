import { writable, derived, get } from 'svelte/store'
import type { Template, TemplateCategory, ProjectData } from '@/types'
import { BUILTIN_TEMPLATES } from '@/data/templates'
import { v4 as uuidv4 } from 'uuid'

const STORAGE_KEY = 'washi-tape-templates'

function loadCustomTemplates(): Template[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (e) {
    console.error('Failed to load custom templates:', e)
  }
  return []
}

function saveCustomTemplates(templates: Template[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(templates))
  } catch (e) {
    console.error('Failed to save custom templates:', e)
  }
}

function createTemplateStore() {
  const builtinTemplates = writable<Template[]>([...BUILTIN_TEMPLATES])
  const customTemplates = writable<Template[]>(loadCustomTemplates())
  const loading = writable(false)

  const allTemplates = derived([builtinTemplates, customTemplates], ([$builtin, $custom]) => {
    return [...$builtin, ...$custom]
  })

  const templatesByCategory = derived(allTemplates, ($templates) => {
    const map = new Map<TemplateCategory | 'all', Template[]>()
    map.set('all', $templates)
    
    for (const template of $templates) {
      const category = template.category
      if (!map.has(category)) {
        map.set(category, [])
      }
      map.get(category)!.push(template)
    }
    
    return map
  })

  const customTemplatesList = derived(customTemplates, ($custom) => $custom)

  function getTemplatesByCategory(category: TemplateCategory | 'all'): Template[] {
    const map = get(templatesByCategory)
    return map.get(category) || []
  }

  function saveAsCustomTemplate(
    name: string,
    category: TemplateCategory,
    description: string,
    thumbnail: string,
    projectData: ProjectData,
    keepTapeReferences: boolean = false
  ): Template {
    const newTemplate: Template = {
      id: `custom-${uuidv4()}`,
      name,
      category,
      description,
      thumbnail,
      isBuiltin: false,
      keepTapeReferences,
      createdAt: new Date().toISOString(),
      data: JSON.parse(JSON.stringify(projectData)),
    }

    if (!keepTapeReferences) {
      newTemplate.data.elements = newTemplate.data.elements.map(el => {
        if (el.type === 'tape') {
          return {
            ...el,
            tapeId: 'builtin-tape-placeholder',
          }
        }
        return el
      })
    }

    customTemplates.update(templates => {
      const updated = [...templates, newTemplate]
      saveCustomTemplates(updated)
      return updated
    })

    return newTemplate
  }

  function deleteCustomTemplate(id: string) {
    customTemplates.update(templates => {
      const updated = templates.filter(t => t.id !== id)
      saveCustomTemplates(updated)
      return updated
    })
  }

  function updateCustomTemplate(id: string, updates: Partial<Template>) {
    customTemplates.update(templates => {
      const index = templates.findIndex(t => t.id === id)
      if (index !== -1) {
        templates[index] = { ...templates[index], ...updates }
        saveCustomTemplates(templates)
      }
      return [...templates]
    })
  }

  function getTemplateById(id: string): Template | undefined {
    return get(allTemplates).find(t => t.id === id)
  }

  function useTemplate(template: Template): ProjectData {
    const data: ProjectData = JSON.parse(JSON.stringify(template.data))
    
    data.elements = data.elements.map(el => ({
      ...el,
      id: uuidv4(),
    }))
    
    return data
  }

  function refreshBuiltinTemplates() {
    builtinTemplates.set([...BUILTIN_TEMPLATES])
  }

  return {
    builtinTemplates,
    customTemplates,
    allTemplates,
    templatesByCategory,
    customTemplatesList,
    loading,
    getTemplatesByCategory,
    saveAsCustomTemplate,
    deleteCustomTemplate,
    updateCustomTemplate,
    getTemplateById,
    useTemplate,
    refreshBuiltinTemplates,
  }
}

export const useTemplateStore = createTemplateStore
