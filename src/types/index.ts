export interface Position {
  x: number
  y: number
}

export interface Size {
  width: number
  height: number
}

export interface CanvasElement {
  id: string
  type: 'tape' | 'sticker' | 'note'
  x: number
  y: number
  width: number
  height: number
  rotation: number
  zIndex: number
  opacity: number
  locked: boolean
}

export interface TapeElement extends CanvasElement {
  type: 'tape'
  tapeId: string
  repeat: boolean
}

export interface StickerElement extends CanvasElement {
  type: 'sticker'
  stickerId: string
}

export interface NoteElement extends CanvasElement {
  type: 'note'
  text: string
  fontSize: number
  fontFamily: string
  color: string
  backgroundColor: string
  borderColor: string
  textAlign: 'left' | 'center' | 'right'
  padding: number
}

export type AnyCanvasElement = TapeElement | StickerElement | NoteElement

export type ShapeType = 'line' | 'arrow' | 'rectangle' | 'circle' | 'heart' | 'star'
export type BrushMode = 'pen' | 'eraser' | 'shape'
export type LineStyle = 'solid' | 'dashed' | 'dotted'

export interface DrawingStroke {
  id: string
  type: 'freehand' | ShapeType
  points: Position[]
  color: string
  width: number
  opacity: number
  lineStyle: LineStyle
}

export interface TapeAsset {
  id: string
  name: string
  data: string
  width: number
  height: number
  createdAt: string
}

export interface Project {
  id: string
  name: string
  category: string
  thumbnail?: string
  createdAt: string
  updatedAt: string
  data: ProjectData
}

export interface ProjectData {
  canvasWidth: number
  canvasHeight: number
  backgroundColor: string
  backgroundPattern: string
  backgroundOpacity: number
  showGrid: boolean
  gridSize: number
  gridColor: string
  showRuler: boolean
  snapToGrid: boolean
  elements: AnyCanvasElement[]
  drawings?: DrawingStroke[]
}

export interface Category {
  id: string
  name: string
  color: string
}

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'daily', name: '日常', color: '#FFB6C1' },
  { id: 'travel', name: '旅行', color: '#87CEEB' },
  { id: 'festival', name: '节日', color: '#DDA0DD' },
  { id: 'work', name: '工作', color: '#98FB98' },
  { id: 'study', name: '学习', color: '#F0E68C' },
]

export const MACARON_COLORS = {
  pink: '#FFB6C1',
  pinkLight: '#FFC0CB',
  blue: '#87CEEB',
  blueLight: '#B0E0E6',
  purple: '#DDA0DD',
  purpleLight: '#E6E6FA',
  green: '#98FB98',
  greenLight: '#90EE90',
  yellow: '#F0E68C',
  yellowLight: '#FAFAD2',
  orange: '#FFDAB9',
  orangeLight: '#FFE4C4',
  beige: '#FFF8DC',
  cream: '#FFFAF0',
  white: '#FFFFFF',
  gray: '#D3D3D3',
}

export const HAND_WRITING_FONTS = [
  'Ma Shan Zheng',
  'ZCOOL KuaiLe',
  'Segoe Script',
  'Comic Sans MS',
  'cursive',
]

export type TemplateCategory = 
  | 'daily' 
  | 'weekly' 
  | 'monthly' 
  | 'travel' 
  | 'reading' 
  | 'festival' 
  | 'custom'

export interface Template {
  id: string
  name: string
  category: TemplateCategory
  description: string
  thumbnail: string
  isBuiltin: boolean
  keepTapeReferences: boolean
  createdAt: string
  data: ProjectData
}

export const TEMPLATE_CATEGORIES: { id: TemplateCategory | 'all'; name: string; icon: string; color: string }[] = [
  { id: 'all', name: '全部', icon: '📚', color: '#DDA0DD' },
  { id: 'daily', name: '日记页', icon: '📔', color: '#FFB6C1' },
  { id: 'weekly', name: '周计划', icon: '📅', color: '#87CEEB' },
  { id: 'monthly', name: '月计划', icon: '🗓️', color: '#98FB98' },
  { id: 'travel', name: '旅行手账', icon: '✈️', color: '#FFDAB9' },
  { id: 'reading', name: '读书笔记', icon: '📖', color: '#F0E68C' },
  { id: 'festival', name: '节日贺卡', icon: '🎊', color: '#DDA0DD' },
  { id: 'custom', name: '我的模板', icon: '⭐', color: '#FFA07A' },
]
