<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import { useProjectStore } from '@/stores/project'
  import { saveProjectDialog, openProjectDialog, exportImageDialog } from '@/services/tauri'
  import { useToast } from '@/utils/toast'
  import { MACARON_COLORS } from '@/types'

  const dispatch = createEventDispatcher()
  const projectStore = useProjectStore()
  const { showToast } = useToast()

  const { 
    currentProjectName, 
    currentCategory, 
    currentProjectId, 
    zoom 
  } = projectStore

  let projectName: string

  $: projectName = $currentProjectName

  function updateProjectName(e: Event) {
    const target = e.target as HTMLInputElement
    projectStore.setProjectName(target.value)
  }

  async function handleSave() {
    const result = await saveProjectDialog(
      projectStore.getProjectData(),
      $currentProjectName,
      $currentCategory.name,
      $currentProjectId || undefined
    )
    
    if (result) {
      showToast('排版方案保存成功！', 'success')
    }
  }

  async function handleOpen() {
    const result = await openProjectDialog()
    if (result) {
      projectStore.loadProjectData(result.project.data)
      projectStore.setProjectName(result.project.name)
      projectStore.currentProjectId.set(result.project.id)
      showToast('排版方案加载成功！', 'success')
    }
  }

  async function handleExport() {
    const canvasEl = document.querySelector('.canvas-content') as HTMLElement
    const result = await exportImageDialog(canvasEl)
    if (result) {
      showToast('成品图导出成功！', 'success')
    }
  }

  function handleNew() {
    projectStore.resetProject()
    showToast('已创建新画布', 'info')
  }

  function handleZoomIn() {
    projectStore.setZoom($zoom + 10)
  }

  function handleZoomOut() {
    projectStore.setZoom($zoom - 10)
  }

  function handleResetZoom() {
    projectStore.setZoom(100)
  }

  function handleFit() {
    const container = document.querySelector('.canvas-area')
    const canvas = document.querySelector('.canvas-content')
    if (container && canvas) {
      const containerRect = container.getBoundingClientRect()
      const canvasRect = canvas.getBoundingClientRect()
      const scale = Math.min(
        (containerRect.width - 80) / canvasRect.width,
        (containerRect.height - 80) / canvasRect.height,
        1
      )
      projectStore.setZoom(Math.round(scale * 100))
    }
  }
</script>

<header class="header">
  <div class="header-left">
    <div class="logo">
      <span class="logo-icon">🎀</span>
      <span class="logo-text">手账胶带</span>
    </div>
    
    <div class="project-info">
      <input
        type="text"
        class="project-name-input"
        value={projectName}
        on:input={updateProjectName}
        placeholder="未命名手账"
      />
      <span class="project-category" style="background: {$currentCategory.color}">
        {$currentCategory.name}
      </span>
    </div>
  </div>

  <div class="header-center">
    <div class="zoom-controls">
      <button class="btn btn-sm" on:click={handleZoomOut} title="缩小">
        <span>−</span>
      </button>
      <span class="zoom-value" on:click={handleResetZoom}>{$zoom}%</span>
      <button class="btn btn-sm" on:click={handleZoomIn} title="放大">
        <span>+</span>
      </button>
      <button class="btn btn-sm" on:click={handleFit} title="适应窗口">
        <span>⛶</span>
      </button>
    </div>
  </div>

  <div class="header-right">
    <button class="btn btn-sm" on:click={handleNew} title="新建">
      <span>📄</span> 新建
    </button>
    <button class="btn btn-sm" on:click={handleOpen} title="打开">
      <span>📂</span> 打开
    </button>
    <button class="btn btn-sm btn-primary" on:click={handleSave} title="保存">
      <span>💾</span> 保存
    </button>
    <button class="btn btn-sm btn-success" on:click={() => dispatch('open-projects')} title="项目管理">
      <span>📁</span> 项目
    </button>
    <button class="btn btn-sm btn-secondary" on:click={handleExport} title="导出图片">
      <span>🖼️</span> 导出
    </button>
  </div>
</header>

<style lang="scss">
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 20px;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-bottom: 3px solid var(--text-primary);
    position: relative;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: repeating-linear-gradient(
        90deg,
        var(--macaron-pink) 0px,
        var(--macaron-pink) 30px,
        var(--macaron-blue) 30px,
        var(--macaron-blue) 60px,
        var(--macaron-yellow) 60px,
        var(--macaron-yellow) 90px,
        var(--macaron-green) 90px,
        var(--macaron-green) 120px,
        var(--macaron-purple) 120px,
        var(--macaron-purple) 150px
      );
    }
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 20px;
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: var(--font-hand);
    font-size: 24px;
    color: var(--text-primary);
    
    .logo-icon {
      font-size: 28px;
      animation: wiggle 3s ease-in-out infinite;
    }
  }

  .project-info {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .project-name-input {
    padding: 6px 12px;
    border: 2px dashed var(--text-secondary);
    border-radius: var(--border-radius-sm);
    background: var(--macaron-cream);
    font-family: var(--font-hand);
    font-size: 16px;
    color: var(--text-primary);
    width: 180px;
    transition: all var(--transition-fast);
    
    &:focus {
      outline: none;
      border-style: solid;
      border-color: var(--macaron-pink);
      background: var(--macaron-white);
    }
  }

  .project-category {
    padding: 4px 12px;
    border-radius: 20px;
    font-family: var(--font-hand);
    font-size: 13px;
    color: var(--text-primary);
    border: 2px solid var(--text-primary);
  }

  .header-center {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .zoom-controls {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 8px;
    background: var(--macaron-cream);
    border: 2px solid var(--text-primary);
    border-radius: var(--border-radius-md);
    
    .zoom-value {
      min-width: 50px;
      text-align: center;
      font-family: var(--font-hand);
      font-size: 15px;
      cursor: pointer;
      user-select: none;
      
      &:hover {
        color: var(--macaron-pink);
      }
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 8px;
  }
</style>
