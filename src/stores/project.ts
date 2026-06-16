import { writable, derived, get } from 'svelte/store'
import type { AnyCanvasElement, ProjectData, Category } from '@/types'
import { DEFAULT_CATEGORIES, MACARON_COLORS } from '@/types'
import { v4 as uuidv4 } from 'uuid'

function createProjectStore() {
  const currentProjectId = writable<string | null>(null)
  const currentProjectName = writable('未命名手账')
  const currentCategory = writable<Category>(DEFAULT_CATEGORIES[0])
  const canvasWidth = writable(800)
  const canvasHeight = writable(1000)
  const backgroundColor = writable(MACARON_COLORS.cream)
  const backgroundPattern = writable('none')
  const elements = writable<AnyCanvasElement[]>([])
  const selectedElementId = writable<string | null>(null)
  const zoom = writable(100)
  const categories = writable<Category[]>([...DEFAULT_CATEGORIES])
  const resetSignal = writable(0)

  const selectedElement = derived([elements, selectedElementId], ([$elements, $selectedId]) => {
    if (!$selectedId) return null
    return $elements.find(el => el.id === $selectedId) || null
  })

  const sortedElements = derived(elements, ($elements) => {
    return [...$elements].sort((a, b) => a.zIndex - b.zIndex)
  })

  const maxZIndex = derived(elements, ($elements) => {
    if ($elements.length === 0) return 0
    return Math.max(...$elements.map(el => el.zIndex))
  })

  function setCanvasSize(width: number, height: number) {
    canvasWidth.set(width)
    canvasHeight.set(height)
  }

  function setBackgroundColor(color: string) {
    backgroundColor.set(color)
  }

  function setBackgroundPattern(pattern: string) {
    backgroundPattern.set(pattern)
  }

  function addElement(element: Omit<AnyCanvasElement, 'id' | 'zIndex'>) {
    const newElement: AnyCanvasElement = {
      ...element,
      id: uuidv4(),
      zIndex: get(maxZIndex) + 1,
    } as AnyCanvasElement
    elements.update(els => [...els, newElement])
    selectElement(newElement.id)
    return newElement
  }

  function updateElement(id: string, updates: Partial<AnyCanvasElement>) {
    elements.update(els => {
      const index = els.findIndex(el => el.id === id)
      if (index !== -1) {
        els[index] = { ...els[index], ...updates } as AnyCanvasElement
      }
      return [...els]
    })
  }

  function deleteElement(id: string) {
    elements.update(els => els.filter(el => el.id !== id))
    if (get(selectedElementId) === id) {
      selectedElementId.set(null)
    }
  }

  function selectElement(id: string | null) {
    selectedElementId.set(id)
  }

  function bringToFront(id: string) {
    elements.update(els => {
      const element = els.find(el => el.id === id)
      if (element) {
        element.zIndex = get(maxZIndex) + 1
      }
      return [...els]
    })
  }

  function sendToBack(id: string) {
    elements.update(els => {
      const element = els.find(el => el.id === id)
      if (element) {
        const minZ = Math.min(...els.map(el => el.zIndex))
        element.zIndex = minZ - 1
      }
      return [...els]
    })
  }

  function moveForward(id: string) {
    elements.update(els => {
      const element = els.find(el => el.id === id)
      if (!element) return els
      
      const sorted = [...els].sort((a, b) => a.zIndex - b.zIndex)
      const currentIndex = sorted.findIndex(el => el.id === id)
      if (currentIndex < sorted.length - 1) {
        const nextElement = sorted[currentIndex + 1]
        const temp = element.zIndex
        element.zIndex = nextElement.zIndex
        nextElement.zIndex = temp
      }
      return [...els]
    })
  }

  function moveBackward(id: string) {
    elements.update(els => {
      const element = els.find(el => el.id === id)
      if (!element) return els
      
      const sorted = [...els].sort((a, b) => a.zIndex - b.zIndex)
      const currentIndex = sorted.findIndex(el => el.id === id)
      if (currentIndex > 0) {
        const prevElement = sorted[currentIndex - 1]
        const temp = element.zIndex
        element.zIndex = prevElement.zIndex
        prevElement.zIndex = temp
      }
      return [...els]
    })
  }

  function duplicateElement(id: string) {
    const element = get(elements).find(el => el.id === id)
    if (element) {
      const newElement: AnyCanvasElement = {
        ...element,
        id: uuidv4(),
        x: element.x + 20,
        y: element.y + 20,
        zIndex: get(maxZIndex) + 1,
      } as AnyCanvasElement
      elements.update(els => [...els, newElement])
      selectElement(newElement.id)
    }
  }

  function clearCanvas() {
    elements.set([])
    selectedElementId.set(null)
  }

  function setZoom(value: number) {
    zoom.set(Math.max(25, Math.min(200, value)))
  }

  function setProjectName(name: string) {
    currentProjectName.set(name)
  }

  function setCategory(category: Category) {
    currentCategory.set(category)
  }

  function addCategory(category: Category) {
    categories.update(cats => [...cats, category])
  }

  function loadProjectData(data: ProjectData) {
    canvasWidth.set(data.canvasWidth)
    canvasHeight.set(data.canvasHeight)
    backgroundColor.set(data.backgroundColor)
    backgroundPattern.set(data.backgroundPattern)
    elements.set(data.elements)
    selectedElementId.set(null)
  }

  function getProjectData(): ProjectData {
    return {
      canvasWidth: get(canvasWidth),
      canvasHeight: get(canvasHeight),
      backgroundColor: get(backgroundColor),
      backgroundPattern: get(backgroundPattern),
      elements: get(elements),
    }
  }

  function resetProject() {
    currentProjectId.set(null)
    currentProjectName.set('未命名手账')
    currentCategory.set(DEFAULT_CATEGORIES[0])
    canvasWidth.set(800)
    canvasHeight.set(1000)
    backgroundColor.set(MACARON_COLORS.cream)
    backgroundPattern.set('none')
    elements.set([])
    selectedElementId.set(null)
    zoom.set(100)
    resetSignal.update(s => s + 1)
  }

  return {
    currentProjectId,
    currentProjectName,
    currentCategory,
    canvasWidth,
    canvasHeight,
    backgroundColor,
    backgroundPattern,
    elements,
    selectedElementId,
    selectedElement,
    sortedElements,
    zoom,
    categories,
    maxZIndex,
    resetSignal,
    setCanvasSize,
    setBackgroundColor,
    setBackgroundPattern,
    addElement,
    updateElement,
    deleteElement,
    selectElement,
    bringToFront,
    sendToBack,
    moveForward,
    moveBackward,
    duplicateElement,
    clearCanvas,
    setZoom,
    setProjectName,
    setCategory,
    addCategory,
    loadProjectData,
    getProjectData,
    resetProject,
  }
}

export const useProjectStore = createProjectStore
