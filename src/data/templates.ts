import type { Template, AnyCanvasElement, ProjectData } from '@/types'
import { MACARON_COLORS } from '@/types'
import { v4 as uuidv4 } from 'uuid'

function createNoteElement(
  x: number,
  y: number,
  width: number,
  height: number,
  text: string,
  bgColor: string,
  zIndex: number,
  options: Partial<{ fontSize: number; fontFamily: string; color: string; borderColor: string; textAlign: string; padding: number; rotation: number }> = {}
): AnyCanvasElement {
  return {
    id: uuidv4(),
    type: 'note',
    x,
    y,
    width,
    height,
    rotation: options.rotation || 0,
    zIndex,
    opacity: 1,
    locked: false,
    text,
    fontSize: options.fontSize || 16,
    fontFamily: options.fontFamily || 'Ma Shan Zheng',
    color: options.color || '#5D4E5E',
    backgroundColor: bgColor,
    borderColor: options.borderColor || '#5D4E5E',
    textAlign: (options.textAlign as 'left' | 'center' | 'right') || 'left',
    padding: options.padding || 12,
  }
}

function createTapeElement(
  x: number,
  y: number,
  width: number,
  height: number,
  zIndex: number,
  options: Partial<{ rotation: number; opacity: number }> = {}
): AnyCanvasElement {
  return {
    id: uuidv4(),
    type: 'tape',
    x,
    y,
    width,
    height,
    rotation: options.rotation || 0,
    zIndex,
    opacity: options.opacity || 0.85,
    locked: false,
    tapeId: 'builtin-tape-placeholder',
    repeat: true,
  }
}

interface CanvasConfig {
  width?: number
  height?: number
  pattern?: string
  opacity?: number
  showGrid?: boolean
  gridSize?: number
  gridColor?: string
  showRuler?: boolean
  snapToGrid?: boolean
}

function createProjectData(
  bgColor: string,
  elements: AnyCanvasElement[],
  config: CanvasConfig = {}
): ProjectData {
  const {
    width = 800,
    height = 1000,
    pattern = 'none',
    opacity = 1,
    showGrid = false,
    gridSize = 30,
    gridColor = 'rgba(93, 78, 94, 0.15)',
    showRuler = false,
    snapToGrid = false,
  } = config

  return {
    canvasWidth: width,
    canvasHeight: height,
    backgroundColor: bgColor,
    backgroundPattern: pattern,
    backgroundOpacity: opacity,
    showGrid,
    gridSize,
    gridColor,
    showRuler,
    snapToGrid,
    elements,
  }
}

const dailyTemplate: Template = {
  id: 'builtin-daily-1',
  name: '温馨日记页',
  category: 'daily',
  description: '粉色系温馨日记排版，适合记录每日心情与小事',
  thumbnail: '📔',
  isBuiltin: true,
  keepTapeReferences: false,
  createdAt: '2024-01-01T00:00:00.000Z',
  data: createProjectData(MACARON_COLORS.cream, [
    createTapeElement(50, 40, 120, 30, 1, { rotation: -3 }),
    createTapeElement(630, 40, 120, 30, 2, { rotation: 3 }),
    createNoteElement(80, 100, 640, 60, '2024年  月  日  星期__   天气：___', MACARON_COLORS.pinkLight, 3, {
      fontSize: 22,
      textAlign: 'center',
      borderColor: MACARON_COLORS.pink,
    }),
    createTapeElement(100, 200, 80, 25, 4, { rotation: -2 }),
    createNoteElement(80, 200, 320, 200, '今日心情：\n\n\n\n今天发生的有趣的事...', MACARON_COLORS.white, 5, {
      borderColor: MACARON_COLORS.pink,
      rotation: -1,
    }),
    createTapeElement(450, 210, 80, 25, 6, { rotation: 2 }),
    createNoteElement(430, 210, 300, 180, '小确幸：\n\n\n\n感恩的事...', MACARON_COLORS.yellowLight, 7, {
      borderColor: MACARON_COLORS.yellow,
      rotation: 1,
    }),
    createTapeElement(260, 440, 100, 28, 8),
    createNoteElement(80, 440, 640, 200, '今日随笔\n\n\n\n\n\n\n\n\n', MACARON_COLORS.blueLight, 9, {
      fontSize: 18,
      borderColor: MACARON_COLORS.blue,
    }),
    createNoteElement(80, 680, 300, 150, '待办清单：\n□ \n□ \n□ \n□ \n□ ', MACARON_COLORS.greenLight, 10, {
      borderColor: MACARON_COLORS.green,
    }),
    createNoteElement(420, 680, 300, 150, '明日计划：\n\n\n\n\n', MACARON_COLORS.purpleLight, 11, {
      borderColor: MACARON_COLORS.purple,
    }),
    createTapeElement(350, 870, 100, 25, 12, { rotation: -2 }),
    createNoteElement(200, 870, 400, 80, '「 每一天都值得被认真记录 」', MACARON_COLORS.orangeLight, 13, {
      fontSize: 20,
      textAlign: 'center',
      borderColor: MACARON_COLORS.orange,
    }),
  ], { pattern: 'lines', gridSize: 25 }),
}

const dailyTemplate2: Template = {
  id: 'builtin-daily-2',
  name: '简约日记本',
  category: 'daily',
  description: '清新简约风格，适合喜欢干净排版的日记记录',
  thumbnail: '📓',
  isBuiltin: true,
  keepTapeReferences: false,
  createdAt: '2024-01-01T00:00:00.000Z',
  data: createProjectData('#FFFFFF', [
    createNoteElement(60, 60, 680, 80, 'My Diary', MACARON_COLORS.cream, 1, {
      fontSize: 32,
      textAlign: 'center',
      fontFamily: 'Segoe Script',
    }),
    createNoteElement(80, 170, 200, 40, '日期：____/____/____', MACARON_COLORS.white, 2, {
      fontSize: 16,
    }),
    createNoteElement(310, 170, 200, 40, '天气：__________', MACARON_COLORS.white, 3, {
      fontSize: 16,
    }),
    createNoteElement(540, 170, 180, 40, '心情：__________', MACARON_COLORS.white, 4, {
      fontSize: 16,
    }),
    createNoteElement(80, 250, 640, 350, '', MACARON_COLORS.cream, 5, {
      fontSize: 18,
      borderColor: MACARON_COLORS.gray,
    }),
    createNoteElement(80, 640, 300, 150, '今日关键词：\n\n#____ #____ #____\n#____ #____', MACARON_COLORS.pinkLight, 6, {
      borderColor: MACARON_COLORS.pink,
    }),
    createNoteElement(420, 640, 300, 150, 'Quote of the day:\n\n\n"_________________\n_________________"', MACARON_COLORS.blueLight, 7, {
      fontFamily: 'Segoe Script',
      borderColor: MACARON_COLORS.blue,
    }),
  ], { pattern: 'dots', gridSize: 20 }),
}

const weeklyTemplate: Template = {
  id: 'builtin-weekly-1',
  name: '周计划本',
  category: 'weekly',
  description: '一周七天清晰规划，高效安排每周事务',
  thumbnail: '📅',
  isBuiltin: true,
  keepTapeReferences: false,
  createdAt: '2024-01-01T00:00:00.000Z',
  data: createProjectData(MACARON_COLORS.blueLight, [
    createTapeElement(300, 30, 200, 30, 1),
    createNoteElement(100, 40, 600, 70, '📅 本周计划  _____月 第__周', MACARON_COLORS.white, 2, {
      fontSize: 26,
      textAlign: 'center',
      borderColor: MACARON_COLORS.blue,
    }),
    createNoteElement(80, 140, 200, 240, '🌟 周一\n\n\n\n\n\n\n\n', MACARON_COLORS.pinkLight, 3, {
      borderColor: MACARON_COLORS.pink,
    }),
    createNoteElement(300, 140, 200, 240, '✨ 周二\n\n\n\n\n\n\n\n', MACARON_COLORS.yellowLight, 4, {
      borderColor: MACARON_COLORS.yellow,
    }),
    createNoteElement(520, 140, 200, 240, '🌿 周三\n\n\n\n\n\n\n\n', MACARON_COLORS.greenLight, 5, {
      borderColor: MACARON_COLORS.green,
    }),
    createNoteElement(80, 400, 200, 240, '💜 周四\n\n\n\n\n\n\n\n', MACARON_COLORS.purpleLight, 6, {
      borderColor: MACARON_COLORS.purple,
    }),
    createNoteElement(300, 400, 200, 240, '🧡 周五\n\n\n\n\n\n\n\n', MACARON_COLORS.orangeLight, 7, {
      borderColor: MACARON_COLORS.orange,
    }),
    createNoteElement(520, 400, 200, 240, '🎉 周六\n\n\n\n\n\n\n\n', MACARON_COLORS.pinkLight, 8, {
      borderColor: MACARON_COLORS.pink,
    }),
    createNoteElement(80, 660, 640, 100, '☀️ 周日\n\n\n\n', MACARON_COLORS.cream, 9, {
      borderColor: MACARON_COLORS.yellow,
    }),
    createNoteElement(80, 790, 640, 120, '📝 本周总结 & 下周展望\n\n\n', MACARON_COLORS.blueLight, 10, {
      fontSize: 18,
      textAlign: 'center',
      borderColor: MACARON_COLORS.blue,
    }),
  ], { showGrid: true, gridSize: 20, snapToGrid: true }),
}

const weeklyTemplate2: Template = {
  id: 'builtin-weekly-2',
  name: '效率周记',
  category: 'weekly',
  description: '目标导向型周计划，包含习惯追踪与重点任务',
  thumbnail: '📋',
  isBuiltin: true,
  keepTapeReferences: false,
  createdAt: '2024-01-01T00:00:00.000Z',
  data: createProjectData(MACARON_COLORS.greenLight, [
    createNoteElement(50, 40, 700, 60, 'WEEKLY PLANNER', MACARON_COLORS.white, 1, {
      fontSize: 28,
      textAlign: 'center',
      fontFamily: 'Segoe Script',
      borderColor: MACARON_COLORS.green,
    }),
    createNoteElement(80, 130, 320, 80, '🎯 本周目标\n1. \n2. \n3. ', MACARON_COLORS.yellowLight, 2, {
      borderColor: MACARON_COLORS.yellow,
    }),
    createNoteElement(420, 130, 300, 80, '💡 本周重点\n- \n- \n- ', MACARON_COLORS.pinkLight, 3, {
      borderColor: MACARON_COLORS.pink,
    }),
    ...([
      { day: 'MON', color: MACARON_COLORS.pinkLight, borderColor: MACARON_COLORS.pink, x: 80, y: 240 },
      { day: 'TUE', color: MACARON_COLORS.yellowLight, borderColor: MACARON_COLORS.yellow, x: 300, y: 240 },
      { day: 'WED', color: MACARON_COLORS.greenLight, borderColor: MACARON_COLORS.green, x: 520, y: 240 },
      { day: 'THU', color: MACARON_COLORS.blueLight, borderColor: MACARON_COLORS.blue, x: 80, y: 430 },
      { day: 'FRI', color: MACARON_COLORS.purpleLight, borderColor: MACARON_COLORS.purple, x: 300, y: 430 },
      { day: 'SAT', color: MACARON_COLORS.orangeLight, borderColor: MACARON_COLORS.orange, x: 520, y: 430 },
      { day: 'SUN', color: MACARON_COLORS.cream, borderColor: MACARON_COLORS.gray, x: 300, y: 620 },
    ] as const).map((d, i) =>
      createNoteElement(d.x, d.y, 200, 170, `${d.day}\n\n\n\n\n\n\n`, d.color, i + 4, {
        borderColor: d.borderColor,
      })
    ),
    createNoteElement(80, 820, 640, 100, '✅ 习惯追踪  💪运动  📚阅读  💧喝水  😴早睡  🧘冥想', MACARON_COLORS.greenLight, 11, {
      fontSize: 16,
      borderColor: MACARON_COLORS.green,
    }),
  ], { pattern: 'grid', gridSize: 20, showGrid: true, snapToGrid: true }),
}

const monthlyTemplate: Template = {
  id: 'builtin-monthly-1',
  name: '月度概览',
  category: 'monthly',
  description: '一月总览日历式排版，清晰规划每月大事',
  thumbnail: '🗓️',
  isBuiltin: true,
  keepTapeReferences: false,
  createdAt: '2024-01-01T00:00:00.000Z',
  data: createProjectData(MACARON_COLORS.purpleLight, [
    createNoteElement(100, 40, 600, 80, '🗓️  2024 年  ___ 月', MACARON_COLORS.white, 1, {
      fontSize: 32,
      textAlign: 'center',
      borderColor: MACARON_COLORS.purple,
    }),
    createNoteElement(80, 150, 80, 50, '一', MACARON_COLORS.pinkLight, 2, { textAlign: 'center', fontSize: 18, borderColor: MACARON_COLORS.pink }),
    createNoteElement(180, 150, 80, 50, '二', MACARON_COLORS.yellowLight, 3, { textAlign: 'center', fontSize: 18, borderColor: MACARON_COLORS.yellow }),
    createNoteElement(280, 150, 80, 50, '三', MACARON_COLORS.greenLight, 4, { textAlign: 'center', fontSize: 18, borderColor: MACARON_COLORS.green }),
    createNoteElement(380, 150, 80, 50, '四', MACARON_COLORS.blueLight, 5, { textAlign: 'center', fontSize: 18, borderColor: MACARON_COLORS.blue }),
    createNoteElement(480, 150, 80, 50, '五', MACARON_COLORS.purpleLight, 6, { textAlign: 'center', fontSize: 18, borderColor: MACARON_COLORS.purple }),
    createNoteElement(580, 150, 80, 50, '六', MACARON_COLORS.orangeLight, 7, { textAlign: 'center', fontSize: 18, borderColor: MACARON_COLORS.orange }),
    createNoteElement(680, 150, 80, 50, '日', MACARON_COLORS.pinkLight, 8, { textAlign: 'center', fontSize: 18, borderColor: MACARON_COLORS.pink }),
    ...Array.from({ length: 35 }, (_, i) => {
      const row = Math.floor(i / 7)
      const col = i % 7
      const x = 80 + col * 100
      const y = 220 + row * 90
      const colors = [MACARON_COLORS.pinkLight, MACARON_COLORS.yellowLight, MACARON_COLORS.greenLight, MACARON_COLORS.blueLight, MACARON_COLORS.purpleLight, MACARON_COLORS.orangeLight, MACARON_COLORS.cream]
      const borders = [MACARON_COLORS.pink, MACARON_COLORS.yellow, MACARON_COLORS.green, MACARON_COLORS.blue, MACARON_COLORS.purple, MACARON_COLORS.orange, MACARON_COLORS.gray]
      return createNoteElement(x, y, 80, 80, '', colors[col], 9 + i, {
        borderColor: borders[col],
      })
    }),
    createNoteElement(80, 870, 300, 80, '🎯 本月目标\n\n', MACARON_COLORS.yellowLight, 44, { borderColor: MACARON_COLORS.yellow }),
    createNoteElement(420, 870, 300, 80, '✨ 重要日子\n\n', MACARON_COLORS.pinkLight, 45, { borderColor: MACARON_COLORS.pink }),
  ], { showGrid: true, gridSize: 25, snapToGrid: true }),
}

const travelTemplate: Template = {
  id: 'builtin-travel-1',
  name: '旅行日记本',
  category: 'travel',
  description: '记录旅途中的美好瞬间，包含行程、美食、心情',
  thumbnail: '✈️',
  isBuiltin: true,
  keepTapeReferences: false,
  createdAt: '2024-01-01T00:00:00.000Z',
  data: createProjectData(MACARON_COLORS.orangeLight, [
    createTapeElement(320, 25, 160, 30, 1, { rotation: -2 }),
    createNoteElement(80, 40, 640, 80, '✈️ 我的旅行日记', MACARON_COLORS.white, 2, {
      fontSize: 30,
      textAlign: 'center',
      fontFamily: 'Segoe Script',
      borderColor: MACARON_COLORS.orange,
    }),
    createNoteElement(80, 150, 200, 60, '📍 目的地：\n___________', MACARON_COLORS.blueLight, 3, { borderColor: MACARON_COLORS.blue }),
    createNoteElement(300, 150, 200, 60, '📅 日期：\n___/___-___/___', MACARON_COLORS.pinkLight, 4, { borderColor: MACARON_COLORS.pink }),
    createNoteElement(520, 150, 200, 60, '👭 旅伴：\n___________', MACARON_COLORS.yellowLight, 5, { borderColor: MACARON_COLORS.yellow }),
    createNoteElement(80, 240, 300, 180, '🗺️ 行程安排\nDay 1: \nDay 2: \nDay 3: \nDay 4: \nDay 5: ', MACARON_COLORS.greenLight, 6, { borderColor: MACARON_COLORS.green }),
    createNoteElement(420, 240, 300, 180, '📷 精彩瞬间\n\n[照片区]\n\n\n', MACARON_COLORS.purpleLight, 7, { borderColor: MACARON_COLORS.purple }),
    createNoteElement(80, 450, 300, 180, '🍜 美食记录\n\n\n\n\n', MACARON_COLORS.orangeLight, 8, { borderColor: MACARON_COLORS.orange }),
    createNoteElement(420, 450, 300, 180, '💰 花费记录\n交通：___ 元\n住宿：___ 元\n餐饮：___ 元\n门票：___ 元\n总计：___ 元', MACARON_COLORS.yellowLight, 9, { borderColor: MACARON_COLORS.yellow }),
    createNoteElement(80, 660, 640, 250, '💕 旅行心得\n\n\n\n\n\n\n\n\n', MACARON_COLORS.cream, 10, {
      fontSize: 18,
      borderColor: MACARON_COLORS.pink,
    }),
  ], { pattern: 'dots', gridSize: 25 }),
}

const travelTemplate2: Template = {
  id: 'builtin-travel-2',
  name: '城市漫步',
  category: 'travel',
  description: '城市探索主题手账，适合记录City Walk和探店',
  thumbnail: '🏙️',
  isBuiltin: true,
  keepTapeReferences: false,
  createdAt: '2024-01-01T00:00:00.000Z',
  data: createProjectData(MACARON_COLORS.blueLight, [
    createNoteElement(100, 40, 600, 70, '🏙️  City Walk 城市漫步', MACARON_COLORS.white, 1, {
      fontSize: 28,
      textAlign: 'center',
      borderColor: MACARON_COLORS.blue,
    }),
    createNoteElement(80, 140, 350, 60, '📍 城市：_______  日期：_______', MACARON_COLORS.yellowLight, 2, { borderColor: MACARON_COLORS.yellow }),
    createNoteElement(460, 140, 260, 60, '🚶 距离：___km  步数：____', MACARON_COLORS.greenLight, 3, { borderColor: MACARON_COLORS.green }),
    createNoteElement(80, 230, 640, 180, '🗺️ 路线图\n\n[在此画出今日路线]\n\n\n', MACARON_COLORS.cream, 4, { borderColor: MACARON_COLORS.blue }),
    createNoteElement(80, 440, 200, 200, '☕ 探店1\n店名：\n评分：⭐⭐⭐⭐⭐\n备注：\n', MACARON_COLORS.pinkLight, 5, { borderColor: MACARON_COLORS.pink, rotation: -2 }),
    createNoteElement(300, 440, 200, 200, '🍰 探店2\n店名：\n评分：⭐⭐⭐⭐⭐\n备注：\n', MACARON_COLORS.yellowLight, 6, { borderColor: MACARON_COLORS.yellow }),
    createNoteElement(520, 440, 200, 200, '🌿 探店3\n店名：\n评分：⭐⭐⭐⭐⭐\n备注：\n', MACARON_COLORS.greenLight, 7, { borderColor: MACARON_COLORS.green, rotation: 2 }),
    createNoteElement(80, 670, 640, 180, '📸 今日最美瞬间\n\n\n\n\n', MACARON_COLORS.purpleLight, 8, { borderColor: MACARON_COLORS.purple }),
  ], { pattern: 'dots', gridSize: 30 }),
}

const readingTemplate: Template = {
  id: 'builtin-reading-1',
  name: '读书笔记',
  category: 'reading',
  description: '深度阅读笔记模板，记录金句、感悟与思考',
  thumbnail: '📖',
  isBuiltin: true,
  keepTapeReferences: false,
  createdAt: '2024-01-01T00:00:00.000Z',
  data: createProjectData(MACARON_COLORS.yellowLight, [
    createTapeElement(340, 25, 120, 28, 1),
    createNoteElement(80, 40, 640, 70, '📖 读书笔记', MACARON_COLORS.white, 2, {
      fontSize: 28,
      textAlign: 'center',
      fontFamily: 'Segoe Script',
      borderColor: MACARON_COLORS.yellow,
    }),
    createNoteElement(80, 140, 320, 100, '📚 书名：\n\n✍️ 作者：', MACARON_COLORS.cream, 3, { fontSize: 16, borderColor: MACARON_COLORS.yellow }),
    createNoteElement(420, 140, 300, 100, '🏷️ 分类：\n\n⭐ 评分：__________', MACARON_COLORS.cream, 4, { fontSize: 16, borderColor: MACARON_COLORS.yellow }),
    createNoteElement(80, 270, 640, 80, '📝 一句话总结\n\n', MACARON_COLORS.pinkLight, 5, { borderColor: MACARON_COLORS.pink }),
    createNoteElement(80, 380, 300, 250, '💫 精彩摘录\n\n\n\n\n\n\n\n\n', MACARON_COLORS.blueLight, 6, {
      fontSize: 16,
      borderColor: MACARON_COLORS.blue,
    }),
    createNoteElement(420, 380, 300, 250, '💭 我的感悟\n\n\n\n\n\n\n\n\n', MACARON_COLORS.greenLight, 7, {
      fontSize: 16,
      borderColor: MACARON_COLORS.green,
    }),
    createNoteElement(80, 660, 640, 150, '🎯 核心观点 & 行动清单\n\n\n\n\n', MACARON_COLORS.purpleLight, 8, { borderColor: MACARON_COLORS.purple }),
    createNoteElement(80, 840, 640, 80, '🗓️ 阅读日期：___/___  ～  ___/___   共___天', MACARON_COLORS.orangeLight, 9, {
      fontSize: 16,
      borderColor: MACARON_COLORS.orange,
    }),
  ], { pattern: 'lines', gridSize: 25 }),
}

const readingTemplate2: Template = {
  id: 'builtin-reading-2',
  name: '书单收集',
  category: 'reading',
  description: '待读书单记录与追踪，做个快乐的读书人',
  thumbnail: '📚',
  isBuiltin: true,
  keepTapeReferences: false,
  createdAt: '2024-01-01T00:00:00.000Z',
  data: createProjectData(MACARON_COLORS.greenLight, [
    createNoteElement(100, 30, 600, 70, '📚 我的书单  My Reading List', MACARON_COLORS.white, 1, {
      fontSize: 28,
      textAlign: 'center',
      fontFamily: 'Segoe Script',
      borderColor: MACARON_COLORS.green,
    }),
    createNoteElement(80, 130, 200, 60, '📖 已读\n0 本', MACARON_COLORS.greenLight, 2, {
      fontSize: 18,
      textAlign: 'center',
      borderColor: MACARON_COLORS.green,
    }),
    createNoteElement(300, 130, 200, 60, '📘 在读\n0 本', MACARON_COLORS.blueLight, 3, {
      fontSize: 18,
      textAlign: 'center',
      borderColor: MACARON_COLORS.blue,
    }),
    createNoteElement(520, 130, 200, 60, '📕 想读\n0 本', MACARON_COLORS.pinkLight, 4, {
      fontSize: 18,
      textAlign: 'center',
      borderColor: MACARON_COLORS.pink,
    }),
    createNoteElement(80, 220, 640, 50, '📖 已读书单', MACARON_COLORS.greenLight, 5, {
      fontSize: 20,
      textAlign: 'center',
      borderColor: MACARON_COLORS.green,
    }),
    ...Array.from({ length: 4 }, (_, i) =>
      createNoteElement(80, 290 + i * 55, 640, 45, `${i + 1}. 《____________________》  ⭐⭐⭐⭐⭐  ___/___`, i % 2 === 0 ? MACARON_COLORS.cream : MACARON_COLORS.white, i + 6)
    ),
    createNoteElement(80, 520, 640, 50, '📘 在读书单', MACARON_COLORS.blueLight, 10, {
      fontSize: 20,
      textAlign: 'center',
      borderColor: MACARON_COLORS.blue,
    }),
    ...Array.from({ length: 3 }, (_, i) =>
      createNoteElement(80, 590 + i * 55, 640, 45, `${i + 1}. 《____________________》  进度：___%`, i % 2 === 0 ? MACARON_COLORS.blueLight : MACARON_COLORS.cream, i + 11)
    ),
    createNoteElement(80, 770, 640, 50, '📕 想读书单', MACARON_COLORS.pinkLight, 14, {
      fontSize: 20,
      textAlign: 'center',
      borderColor: MACARON_COLORS.pink,
    }),
    createNoteElement(80, 840, 310, 100, '1. \n2. \n3. ', MACARON_COLORS.cream, 15),
    createNoteElement(410, 840, 310, 100, '4. \n5. \n6. ', MACARON_COLORS.white, 16),
  ], { showGrid: true, gridSize: 20, snapToGrid: true }),
}

const festivalTemplate: Template = {
  id: 'builtin-festival-1',
  name: '新年贺卡',
  category: 'festival',
  description: '喜庆新年主题贺卡，红红火火迎新春',
  thumbnail: '🧧',
  isBuiltin: true,
  keepTapeReferences: false,
  createdAt: '2024-01-01T00:00:00.000Z',
  data: createProjectData('#FFE4E1', [
    createNoteElement(100, 40, 600, 100, '🧧  新 年 快 乐  🧧', '#FF6B6B', 1, {
      fontSize: 40,
      textAlign: 'center',
      color: '#FFFFFF',
      borderColor: '#CC0000',
    }),
    createNoteElement(200, 170, 400, 80, 'HAPPY NEW YEAR', '#FFE4E1', 2, {
      fontSize: 32,
      textAlign: 'center',
      fontFamily: 'Segoe Script',
      color: '#CC0000',
    }),
    createNoteElement(80, 290, 640, 300, '致 __________：\n\n\n\n\n\n\n\n\n\n\n\n\n\n', MACARON_COLORS.white, 3, {
      fontSize: 20,
      borderColor: '#CC0000',
    }),
    createNoteElement(80, 620, 640, 120, '愿新的一年\n身体健康  万事如意\n心想事成  阖家幸福', '#FFE4E1', 4, {
      fontSize: 24,
      textAlign: 'center',
      color: '#CC0000',
    }),
    createNoteElement(400, 770, 320, 100, 'From：__________\nDate：____/____/____', MACARON_COLORS.white, 5, {
      fontSize: 16,
      textAlign: 'right',
      borderColor: '#CC0000',
    }),
    createNoteElement(80, 770, 200, 100, '🏮', MACARON_COLORS.white, 6, {
      fontSize: 60,
      textAlign: 'center',
    }),
  ], { opacity: 1 }),
}

const festivalTemplate2: Template = {
  id: 'builtin-festival-2',
  name: '生日贺卡',
  category: 'festival',
  description: '温馨可爱生日贺卡，给最特别的TA',
  thumbnail: '🎂',
  isBuiltin: true,
  keepTapeReferences: false,
  createdAt: '2024-01-01T00:00:00.000Z',
  data: createProjectData(MACARON_COLORS.pinkLight, [
    createNoteElement(200, 30, 400, 80, '🎂  HAPPY BIRTHDAY  🎂', MACARON_COLORS.pink, 1, {
      fontSize: 30,
      textAlign: 'center',
      color: '#FFFFFF',
      fontFamily: 'Segoe Script',
      borderColor: MACARON_COLORS.pink,
    }),
    createNoteElement(300, 130, 200, 60, '🎉 生日快乐 🎉', MACARON_COLORS.yellowLight, 2, {
      fontSize: 24,
      textAlign: 'center',
      borderColor: MACARON_COLORS.yellow,
    }),
    createNoteElement(100, 220, 600, 40, '亲爱的  ____________________ ：', MACARON_COLORS.white, 3, {
      fontSize: 20,
    }),
    createNoteElement(80, 290, 640, 350, '\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n', MACARON_COLORS.white, 4, {
      fontSize: 18,
      borderColor: MACARON_COLORS.pink,
    }),
    createNoteElement(80, 670, 300, 120, '🎁 愿望清单\n\n1. \n2. \n3. ', MACARON_COLORS.purpleLight, 5, { borderColor: MACARON_COLORS.purple }),
    createNoteElement(420, 670, 300, 120, '🌟 生日祝福\n愿你每天都开心\n愿所有愿望都实现\n愿你被世界温柔以待', MACARON_COLORS.greenLight, 6, {
      fontSize: 16,
      textAlign: 'center',
      borderColor: MACARON_COLORS.green,
    }),
    createNoteElement(400, 820, 320, 100, 'With Love\n__________\n____/____/____', MACARON_COLORS.white, 7, {
      fontSize: 16,
      textAlign: 'right',
      fontFamily: 'Segoe Script',
    }),
    createNoteElement(80, 820, 200, 100, '🎈🎊🎁', MACARON_COLORS.white, 8, {
      fontSize: 48,
      textAlign: 'center',
    }),
  ], { opacity: 1 }),
}

const festivalTemplate3: Template = {
  id: 'builtin-festival-3',
  name: '圣诞贺卡',
  category: 'festival',
  description: '浪漫冬日圣诞主题，温暖整个十二月',
  thumbnail: '🎄',
  isBuiltin: true,
  keepTapeReferences: false,
  createdAt: '2024-01-01T00:00:00.000Z',
  data: createProjectData('#E8F5E9', [
    createNoteElement(100, 30, 600, 80, '🎄  Merry Christmas  🎄', '#2E7D32', 1, {
      fontSize: 32,
      textAlign: 'center',
      color: '#FFFFFF',
      fontFamily: 'Segoe Script',
      borderColor: '#1B5E20',
    }),
    createNoteElement(300, 130, 200, 60, '❄️ 圣诞快乐 ❄️', MACARON_COLORS.white, 2, {
      fontSize: 22,
      textAlign: 'center',
      color: '#C62828',
      borderColor: '#2E7D32',
    }),
    createNoteElement(80, 220, 640, 380, 'Dear __________ ：\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n', MACARON_COLORS.white, 3, {
      fontSize: 18,
      borderColor: '#C62828',
    }),
    createNoteElement(80, 630, 200, 150, '🎅', MACARON_COLORS.white, 4, {
      fontSize: 80,
      textAlign: 'center',
    }),
    createNoteElement(300, 630, 200, 150, '🎁 愿望清单\n\n\n', MACARON_COLORS.yellowLight, 5, {
      borderColor: MACARON_COLORS.yellow,
    }),
    createNoteElement(520, 630, 200, 150, '⛄', MACARON_COLORS.white, 6, {
      fontSize: 80,
      textAlign: 'center',
    }),
    createNoteElement(80, 810, 640, 80, 'Wishing you warmth and joy this holiday season!', '#C62828', 7, {
      fontSize: 20,
      textAlign: 'center',
      color: '#FFFFFF',
      fontFamily: 'Segoe Script',
    }),
  ], { opacity: 1 }),
}

export const BUILTIN_TEMPLATES: Template[] = [
  dailyTemplate,
  dailyTemplate2,
  weeklyTemplate,
  weeklyTemplate2,
  monthlyTemplate,
  travelTemplate,
  travelTemplate2,
  readingTemplate,
  readingTemplate2,
  festivalTemplate,
  festivalTemplate2,
  festivalTemplate3,
]
