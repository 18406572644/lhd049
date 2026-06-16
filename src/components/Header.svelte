<script lang="ts">
  import { createEventDispatcher, onMount, onDestroy } from 'svelte'
  import { useProjectStore } from '@/stores/project'
  import { saveProjectDialog, openProjectDialog, exportImageDialog, exportProjectData, loadProjectByPath } from '@/services/tauri'
  import { useToast } from '@/utils/toast'
  import { MACARON_COLORS, DEFAULT_CATEGORIES } from '@/types'
  import { generateThumbnail } from '@/utils/thumbnail'
  import { getRecentProjects, addRecentProject, projectToRecent } from '@/utils/recentProjects'
  import type { RecentProject } from '@/utils/recentProjects'

  const dispatch = createEventDispatcher()
  const projectStore = useProjectStore()
  const { showToast } = useToast()

  const { 
    currentProjectName, 
    currentCategory, 
    currentProjectId, 
    zoom 
  } = projectStore

  let showOpenDropdown = false
  let recentProjects: RecentProject[] = []

  function handleOpenTemplates() {
    dispatch('open-templates')
  }

  function handleSaveAsTemplate() {
    dispatch('save-template')
  }

  let projectName: string

  $: projectName = $currentProjectName

  function updateProjectName(e: Event) {
    const target = e.target as HTMLInputElement
    projectStore.setProjectName(target.value)
  }

  async function handleSave() {
    const canvasEl = document.querySelector('.canvas-content') as HTMLElement
    const thumbnail = await generateThumbnail(canvasEl)
    
    const result = await saveProjectDialog(
      projectStore.getProjectData(),
      $currentProjectName,
      $currentCategory.name,
      $currentProjectId || undefined,
      thumbnail || undefined
    )
    
    if (result) {
      projectStore.currentProjectId.set(result.project.id)
      addRecentProject(projectToRecent(result.project, result.path))
      recentProjects = getRecentProjects()
      showToast('排版方案保存成功！', 'success')
    }
  }

  async function handleOpen() {
    const result = await openProjectDialog()
    if (result) {
      projectStore.loadProjectData(result.project.data)
      projectStore.setProjectName(result.project.name)
      projectStore.currentProjectId.set(result.project.id)
      
      const category = DEFAULT_CATEGORIES.find(c => c.name === result.project.category) || DEFAULT_CATEGORIES[0]
      projectStore.setCategory(category)
      
      addRecentProject(projectToRecent(result.project, result.path))
      recentProjects = getRecentProjects()
      
      showToast('排版方案加载成功！', 'success')
    }
    showOpenDropdown = false
  }

  async function handleOpenRecent(recent: RecentProject) {
    if (!recent.path) {
      showToast('无法找到项目路径', 'error')
      return
    }
    
    const result = await loadProjectByPath(recent.path)
    if (result) {
      projectStore.loadProjectData(result.project.data)
      projectStore.setProjectName(result.project.name)
      projectStore.currentProjectId.set(result.project.id)
      
      const category = DEFAULT_CATEGORIES.find(c => c.name === result.project.category) || DEFAULT_CATEGORIES[0]
      projectStore.setCategory(category)
      
      addRecentProject(projectToRecent(result.project, result.path))
      recentProjects = getRecentProjects()
      
      showToast('排版方案加载成功！', 'success')
    } else {
      showToast('项目文件不存在或已损坏', 'error')
    }
    showOpenDropdown = false
  }

  function toggleOpenDropdown() {
    showOpenDropdown = !showOpenDropdown
    if (showOpenDropdown) {
      recentProjects = getRecentProjects()
    }
  }

  function handleClickOutside(e: MouseEvent) {
    const target = e.target as HTMLElement
    if (!target.closest('.open-dropdown-wrapper')) {
      showOpenDropdown = false
    }
  }

  async function handleExport() {
    const canvasEl = document.querySelector('.canvas-content') as HTMLElement
    const result = await exportImageDialog(canvasEl)
    if (result) {
      showToast('成品图导出成功！', 'success')
    }
  }

  async function handleExportData() {
    const result = await exportProjectData(
      projectStore.getProjectData(),
      $currentProjectName
    )
    if (result) {
      showToast('数据导出成功！', 'success')
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

  function formatDate(dateStr: string): string {
    const date = new Date(dateStr)
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric'
    })
  }

  onMount(() => {
    recentProjects = getRecentProjects()
    document.addEventListener('click', handleClickOutside)
  })

  onDestroy(() => {
    document.removeEventListener('click', handleClickOutside)
  })
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
    <div class="open-dropdown-wrapper">
      <button class="btn btn-sm" on:click|stopPropagation={toggleOpenDropdown} title="打开">
        <span>📂</span> 打开 <span class="dropdown-arrow">▾</span>
      </button>
      {#if showOpenDropdown}
        <div class="open-dropdown" on:click|stopPropagation>
          <div class="dropdown-header">
            <span>最近打开</span>
          </div>
          {#if recentProjects.length === 0}
            <div class="dropdown-empty">暂无记录</div>
          {:else}
            {#each recentProjects as recent (recent.id)}
              <button class="dropdown-item" on:click={() => handleOpenRecent(recent)}>
                <div class="recent-thumb">
                  {#if recent.thumbnail}
                    <img src={recent.thumbnail} alt={recent.name} />
                  {:else}
                    <span class="thumb-placeholder">🖼</span>
                  {/if}
                </div>
                <div class="recent-info">
                  <span class="recent-name">{recent.name}</span>
                  <span class="recent-meta">
                    <span class="recent-category">{recent.category}</span>
                    <span class="recent-date">{formatDate(recent.updatedAt)}</span>
                  </span>
                </div>
              </button>
            {/each}
          {/if}
          <div class="dropdown-divider"></div>
          <button class="dropdown-item dropdown-browse" on:click={handleOpen}>
            <span>📂</span> 浏览文件...
          </button>
        </div>
      {/if}
    </div>
    <button class="btn btn-sm btn-primary" on:click={handleSave} title="保存">
      <span>💾</span> 保存
    </button>
    <button class="btn btn-sm btn-success" on:click={() => dispatch('open-projects')} title="项目管理">
      <span>📁</span> 项目
    </button>
    <button class="btn btn-sm btn-warning" on:click={handleOpenTemplates} title="模板库">
      <span>📚</span> 模板
    </button>
    <button class="btn btn-sm btn-secondary" on:click={handleSaveAsTemplate} title="保存为模板">
      <span>⭐</span> 存为模板
    </button>
    <button class="btn btn-sm btn-secondary" on:click={handleExportData} title="导出数据">
      <span>⬆</span> 导出
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

  .open-dropdown-wrapper {
    position: relative;
  }

  .dropdown-arrow {
    font-size: 10px;
    margin-left: 2px;
  }

  .open-dropdown {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    min-width: 280px;
    background: var(--macaron-white);
    border: 2px solid var(--text-primary);
    border-radius: var(--border-radius-lg);
    box-shadow: var(--shadow-lg);
    z-index: 1000;
    overflow: hidden;
    animation: slideDown 0.2s ease;
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .dropdown-header {
    padding: 10px 16px;
    font-family: var(--font-hand);
    font-size: 14px;
    color: var(--text-secondary);
    background: var(--macaron-cream);
    border-bottom: 2px dashed var(--macaron-gray);
  }

  .dropdown-empty {
    padding: 24px 16px;
    text-align: center;
    font-family: var(--font-hand);
    font-size: 14px;
    color: var(--text-light);
  }

  .dropdown-item {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    padding: 10px 16px;
    border: none;
    background: transparent;
    cursor: pointer;
    text-align: left;
    transition: background var(--transition-fast);
    font-family: var(--font-hand);

    &:hover {
      background: var(--macaron-cream);
    }
  }

  .recent-thumb {
    width: 40px;
    height: 50px;
    border-radius: var(--border-radius-sm);
    border: 1px solid var(--macaron-gray);
    overflow: hidden;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--macaron-cream);

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .thumb-placeholder {
      font-size: 16px;
      opacity: 0.5;
    }
  }

  .recent-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .recent-name {
    font-size: 14px;
    color: var(--text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .recent-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 11px;
    color: var(--text-secondary);
  }

  .recent-category {
    padding: 1px 6px;
    border-radius: 8px;
    background: var(--macaron-pink);
    color: var(--text-primary);
    font-size: 10px;
  }

  .dropdown-divider {
    height: 1px;
    background: var(--macaron-gray);
    margin: 4px 0;
  }

  .dropdown-browse {
    justify-content: center;
    gap: 8px;
    color: var(--macaron-pink);
    font-size: 13px;

    &:hover {
      background: var(--macaron-pink);
      color: white;
    }
  }
</style>
