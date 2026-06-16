<script lang="ts">
  import { onMount } from 'svelte'
  import { createEventDispatcher } from 'svelte'
  import { useProjectStore } from '@/stores/project'
  import { listProjects, openProjectDialog, saveProjectDialog } from '@/services/tauri'
  import { useToast } from '@/utils/toast'
  import type { Project } from '@/types'
  import { DEFAULT_CATEGORIES } from '@/types'

  const dispatch = createEventDispatcher()
  const projectStore = useProjectStore()
  const { showToast } = useToast()

  const {
    currentProjectName,
    currentCategory,
    currentProjectId
  } = projectStore

  let projects: Project[] = []
  let loading = true
  let searchQuery = ''
  let selectedCategory = 'all'

  $: filteredProjects = projects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  async function loadProjects() {
    loading = true
    projects = await listProjects()
    loading = false
  }

  async function handleOpenProject(project: Project) {
    try {
      projectStore.loadProjectData(project.data)
      projectStore.setProjectName(project.name)
      projectStore.currentProjectId.set(project.id)
      
      const category = DEFAULT_CATEGORIES.find(c => c.name === project.category) || DEFAULT_CATEGORIES[0]
      projectStore.setCategory(category)
      
      showToast(`已加载「${project.name}」`, 'success')
      dispatch('close')
    } catch (e) {
      showToast('加载项目失败', 'error')
    }
  }

  async function handleImportProject() {
    const result = await openProjectDialog()
    if (result) {
      await loadProjects()
      showToast('项目导入成功', 'success')
    }
  }

  async function handleSaveCurrent() {
    const result = await saveProjectDialog(
      projectStore.getProjectData(),
      $currentProjectName,
      $currentCategory.name,
      $currentProjectId || undefined
    )
    
    if (result) {
      await loadProjects()
      showToast('保存成功', 'success')
    }
  }

  function formatDate(dateStr: string): string {
    const date = new Date(dateStr)
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  function getCategoryColor(categoryName: string): string {
    const category = DEFAULT_CATEGORIES.find(c => c.name === categoryName)
    return category?.color || 'var(--macaron-gray)'
  }

  onMount(() => {
    loadProjects()
  })
</script>

<div class="modal-overlay" on:click={(e) => e.target === e.currentTarget && dispatch('close')}>
  <div class="modal-content animate-fadeIn">
    <div class="modal-header">
      <h2>📁 项目管理</h2>
      <button class="close-btn" on:click={() => dispatch('close')}>✕</button>
    </div>
    
    <div class="modal-toolbar">
      <div class="search-box">
        <span>🔍</span>
        <input 
          type="text" 
          class="input"
          placeholder="搜索项目..."
          bind:value={searchQuery}
        />
      </div>
      
      <div class="category-filter">
        <button 
          class="filter-btn {selectedCategory === 'all' ? 'active' : ''}"
          on:click={() => selectedCategory = 'all'}
        >
          全部
        </button>
        {#each DEFAULT_CATEGORIES as cat}
          <button 
            class="filter-btn {selectedCategory === cat.name ? 'active' : ''}"
            style="--cat-color: {cat.color}"
            on:click={() => selectedCategory = cat.name}
          >
            {cat.name}
          </button>
        {/each}
      </div>
      
      <div class="toolbar-actions">
        <button class="btn btn-sm btn-primary" on:click={handleImportProject}>
          📂 导入
        </button>
        <button class="btn btn-sm btn-success" on:click={handleSaveCurrent}>
          💾 保存当前
        </button>
      </div>
    </div>
    
    <div class="project-list scrollbar">
      {#if loading}
        <div class="loading-state">
          <div class="loading-spinner"></div>
          <p>加载中...</p>
        </div>
      {:else if filteredProjects.length === 0}
        <div class="empty-state">
          <div class="empty-icon">📭</div>
          <p class="empty-text">
            {searchQuery ? '没有找到匹配的项目' : '还没有保存的项目'}
          </p>
          <button class="btn btn-sm btn-primary" on:click={handleSaveCurrent}>
            保存当前项目
          </button>
        </div>
      {:else}
        <div class="project-grid">
          {#each filteredProjects as project (project.id)}
            <div class="project-card" on:click={() => handleOpenProject(project)}>
              <div class="card-preview">
                <div 
                  class="preview-canvas"
                  style="background-color: {project.data.backgroundColor}"
                >
                  {#if project.data.elements.length > 0}
                    <div class="preview-elements">
                      <span class="element-count">{project.data.elements.length} 个元素</span>
                    </div>
                  {:else}
                    <span class="empty-preview">空白</span>
                  {/if}
                </div>
                <div class="category-badge" style="background: {getCategoryColor(project.category)}">
                  {project.category}
                </div>
              </div>
              <div class="card-info">
                <h4 class="project-name">{project.name}</h4>
                <div class="project-meta">
                  <span>📅 {formatDate(project.updatedAt)}</span>
                  <span>📐 {project.data.canvasWidth}×{project.data.canvasHeight}</span>
                </div>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
    
    <div class="modal-footer">
      <span class="footer-info">
        共 {projects.length} 个项目
      </span>
      <button class="btn btn-sm" on:click={() => dispatch('close')}>
        关闭
      </button>
    </div>
  </div>
</div>

<style lang="scss">
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(93, 78, 94, 0.5);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 40px;
  }

  .modal-content {
    width: 100%;
    max-width: 1000px;
    max-height: 100%;
    background: var(--macaron-white);
    border: 3px solid var(--text-primary);
    border-radius: var(--border-radius-xl);
    box-shadow: var(--shadow-lg);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 6px;
      background: repeating-linear-gradient(
        90deg,
        var(--macaron-pink) 0px,
        var(--macaron-pink) 30px,
        var(--macaron-blue) 30px,
        var(--macaron-blue) 60px,
        var(--macaron-yellow) 60px,
        var(--macaron-yellow) 90px,
        var(--macaron-green) 90px,
        var(--macaron-green) 120px
      );
    }
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 24px;
    padding-top: 28px;
    border-bottom: 2px dashed var(--macaron-gray);
    
    h2 {
      font-family: var(--font-hand);
      font-size: 24px;
      color: var(--text-primary);
    }
  }

  .close-btn {
    width: 32px;
    height: 32px;
    border: 2px solid var(--text-primary);
    border-radius: 50%;
    background: var(--macaron-pink);
    color: white;
    font-size: 14px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all var(--transition-fast);
    
    &:hover {
      background: #ff6b6b;
      transform: rotate(90deg);
    }
  }

  .modal-toolbar {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px 24px;
    border-bottom: 2px dashed var(--macaron-gray);
    flex-wrap: wrap;
  }

  .search-box {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
    min-width: 200px;
    
    .input {
      flex: 1;
    }
  }

  .category-filter {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }

  .filter-btn {
    padding: 6px 14px;
    border: 2px solid var(--text-primary);
    border-radius: 20px;
    background: var(--macaron-white);
    font-family: var(--font-hand);
    font-size: 13px;
    cursor: pointer;
    transition: all var(--transition-fast);
    
    &:hover {
      background: var(--cat-color, var(--macaron-cream));
    }
    
    &.active {
      background: var(--cat-color, var(--macaron-pink));
      box-shadow: 2px 2px 0 var(--text-primary);
    }
  }

  .toolbar-actions {
    display: flex;
    gap: 8px;
    margin-left: auto;
  }

  .project-list {
    flex: 1;
    overflow-y: auto;
    padding: 24px;
  }

  .loading-state,
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    text-align: center;
  }

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid var(--macaron-gray);
    border-top-color: var(--macaron-pink);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 16px;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .empty-icon {
    font-size: 56px;
    margin-bottom: 16px;
    opacity: 0.5;
  }

  .empty-text {
    font-family: var(--font-hand);
    font-size: 16px;
    color: var(--text-secondary);
    margin-bottom: 20px;
  }

  .project-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 16px;
  }

  .project-card {
    background: var(--macaron-cream);
    border: 2px solid var(--text-primary);
    border-radius: var(--border-radius-lg);
    overflow: hidden;
    cursor: pointer;
    transition: all var(--transition-fast);
    
    &:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-md);
      background: var(--macaron-white);
    }
  }

  .card-preview {
    position: relative;
    height: 140px;
    border-bottom: 2px dashed var(--macaron-gray);
  }

  .preview-canvas {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .preview-elements {
    padding: 8px 16px;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 20px;
    font-family: var(--font-hand);
    font-size: 13px;
    color: var(--text-primary);
  }

  .empty-preview {
    font-family: var(--font-hand);
    font-size: 14px;
    color: var(--text-light);
  }

  .category-badge {
    position: absolute;
    top: 8px;
    right: 8px;
    padding: 4px 10px;
    border-radius: 12px;
    font-family: var(--font-hand);
    font-size: 11px;
    color: var(--text-primary);
    border: 1px solid var(--text-primary);
  }

  .card-info {
    padding: 12px 14px;
  }

  .project-name {
    font-family: var(--font-hand);
    font-size: 16px;
    color: var(--text-primary);
    margin-bottom: 6px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .project-meta {
    display: flex;
    flex-direction: column;
    gap: 2px;
    
    span {
      font-size: 11px;
      color: var(--text-secondary);
    }
  }

  .modal-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 24px;
    border-top: 2px dashed var(--macaron-gray);
  }

  .footer-info {
    font-family: var(--font-hand);
    font-size: 14px;
    color: var(--text-secondary);
  }
</style>
