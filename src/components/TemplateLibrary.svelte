<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import { useTemplateStore } from '@/stores/template'
  import { useProjectStore } from '@/stores/project'
  import { useToast } from '@/utils/toast'
  import { TEMPLATE_CATEGORIES } from '@/types'
  import type { Template, TemplateCategory } from '@/types'
  import TemplateCard from '@/components/TemplateCard.svelte'

  const dispatch = createEventDispatcher()
  const templateStore = useTemplateStore()
  const projectStore = useProjectStore()
  const { showToast } = useToast()

  let selectedCategory: TemplateCategory | 'all' = 'all'
  let searchQuery = ''
  let showDeleteConfirm = false
  let templateToDelete: Template | null = null

  const { allTemplates, customTemplatesList } = templateStore

  $: filteredTemplates = $allTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          template.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || 
                           (selectedCategory === 'custom' && !template.isBuiltin) ||
                           template.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  function handleUseTemplate(template: Template) {
    try {
      const projectData = templateStore.useTemplate(template)
      projectStore.resetProject()
      projectStore.loadProjectData(projectData)
      projectStore.setProjectName(template.name)
      
      showToast(`已使用模板「${template.name}」`, 'success')
      dispatch('close')
    } catch (e) {
      console.error('Failed to use template:', e)
      showToast('使用模板失败', 'error')
    }
  }

  function handleDeleteTemplate(template: Template) {
    templateToDelete = template
    showDeleteConfirm = true
  }

  function confirmDelete() {
    if (templateToDelete) {
      templateStore.deleteCustomTemplate(templateToDelete.id)
      showToast(`模板「${templateToDelete.name}」已删除`, 'success')
    }
    cancelDelete()
  }

  function cancelDelete() {
    showDeleteConfirm = false
    templateToDelete = null
  }
</script>

<div class="modal-overlay" on:click={(e) => e.target === e.currentTarget && dispatch('close')}>
  <div class="modal-content animate-fadeIn">
    <div class="modal-header">
      <h2>📚 模板库</h2>
      <button class="close-btn" on:click={() => dispatch('close')}>✕</button>
    </div>
    
    <div class="modal-toolbar">
      <div class="search-box">
        <span>🔍</span>
        <input 
          type="text" 
          class="input"
          placeholder="搜索模板..."
          bind:value={searchQuery}
        />
      </div>
      
      <div class="category-filter scrollbar">
        {#each TEMPLATE_CATEGORIES as cat}
          <button 
            class="filter-btn {selectedCategory === cat.id ? 'active' : ''}"
            style="--cat-color: {cat.color}"
            on:click={() => selectedCategory = cat.id}
          >
            {cat.icon} {cat.name}
            {#if cat.id === 'custom'}
              <span class="count">({$customTemplatesList.length})</span>
            {/if}
          </button>
        {/each}
      </div>
    </div>
    
    <div class="template-list scrollbar">
      {#if filteredTemplates.length === 0}
        <div class="empty-state">
          <div class="empty-icon">📭</div>
          <p class="empty-text">
            {searchQuery ? '没有找到匹配的模板' : selectedCategory === 'custom' ? '还没有保存的自定义模板' : '暂无模板'}
          </p>
          {#if selectedCategory === 'custom' && !searchQuery}
            <p class="empty-hint">在画布编辑界面点击「保存为模板」即可创建</p>
          {/if}
        </div>
      {:else}
        <div class="template-grid">
          {#each filteredTemplates as template (template.id)}
            <TemplateCard 
              template={template}
              on:use={(e) => handleUseTemplate(e.detail)}
              on:delete={(e) => handleDeleteTemplate(e.detail)}
            />
          {/each}
        </div>
      {/if}
    </div>
    
    <div class="modal-footer">
      <span class="footer-info">
        共 {filteredTemplates.length} 个模板
      </span>
      <button class="btn btn-sm" on:click={() => dispatch('close')}>
        关闭
      </button>
    </div>
  </div>

  {#if showDeleteConfirm}
    <div class="confirm-overlay" on:click={(e) => e.target === e.currentTarget && cancelDelete()}>
      <div class="confirm-dialog animate-fadeIn">
        <div class="confirm-icon">⚠️</div>
        <h3>确认删除</h3>
        <p>确定要删除模板「{templateToDelete?.name}」吗？</p>
        <p class="confirm-hint">此操作无法撤销</p>
        <div class="confirm-actions">
          <button class="btn btn-sm" on:click={cancelDelete}>取消</button>
          <button class="btn btn-sm btn-danger" on:click={confirmDelete}>删除</button>
        </div>
      </div>
    </div>
  {/if}
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
    max-width: 1200px;
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
    flex-direction: column;
    gap: 12px;
    padding: 16px 24px;
    border-bottom: 2px dashed var(--macaron-gray);
  }

  .search-box {
    display: flex;
    align-items: center;
    gap: 8px;
    
    .input {
      flex: 1;
    }
  }

  .category-filter {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    overflow-x: auto;
    padding-bottom: 4px;
  }

  .filter-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 6px 14px;
    border: 2px solid var(--text-primary);
    border-radius: 20px;
    background: var(--macaron-white);
    font-family: var(--font-hand);
    font-size: 13px;
    cursor: pointer;
    transition: all var(--transition-fast);
    white-space: nowrap;
    
    &:hover {
      background: var(--cat-color, var(--macaron-cream));
    }
    
    &.active {
      background: var(--cat-color, var(--macaron-pink));
      box-shadow: 2px 2px 0 var(--text-primary);
    }
    
    .count {
      font-size: 11px;
      opacity: 0.8;
    }
  }

  .template-list {
    flex: 1;
    overflow-y: auto;
    padding: 24px;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    text-align: center;
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
    margin-bottom: 8px;
  }

  .empty-hint {
    font-size: 13px;
    color: var(--text-light);
  }

  .template-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 16px;
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

  .confirm-overlay {
    position: absolute;
    inset: 0;
    background: rgba(93, 78, 94, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
  }

  .confirm-dialog {
    background: var(--macaron-white);
    border: 3px solid var(--text-primary);
    border-radius: var(--border-radius-lg);
    padding: 24px 32px;
    text-align: center;
    max-width: 400px;
    box-shadow: var(--shadow-lg);
  }

  .confirm-icon {
    font-size: 48px;
    margin-bottom: 12px;
  }

  .confirm-dialog h3 {
    font-family: var(--font-hand);
    font-size: 20px;
    color: var(--text-primary);
    margin-bottom: 8px;
  }

  .confirm-dialog p {
    font-size: 14px;
    color: var(--text-secondary);
    margin-bottom: 4px;
  }

  .confirm-hint {
    font-size: 12px !important;
    color: var(--text-light) !important;
    margin-bottom: 20px !important;
  }

  .confirm-actions {
    display: flex;
    justify-content: center;
    gap: 12px;
  }
</style>
