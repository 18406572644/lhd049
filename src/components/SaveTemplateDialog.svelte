<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import { useProjectStore } from '@/stores/project'
  import { useTemplateStore } from '@/stores/template'
  import { useToast } from '@/utils/toast'
  import { TEMPLATE_CATEGORIES } from '@/types'
  import type { TemplateCategory } from '@/types'

  const dispatch = createEventDispatcher()
  const projectStore = useProjectStore()
  const templateStore = useTemplateStore()
  const { showToast } = useToast()

  const thumbnailOptions = ['📔', '📓', '📅', '🗓️', '✈️', '🏙️', '📖', '📚', '🎊', '🧧', '🎂', '🎄', '⭐', '💖', '✨']

  let templateName = ''
  let templateDescription = ''
  let templateCategory: TemplateCategory = 'custom'
  let templateThumbnail = '⭐'
  let keepTapeReferences = false

  const availableCategories = TEMPLATE_CATEGORIES.filter(c => c.id !== 'all')

  function handleSave() {
    if (!templateName.trim()) {
      showToast('请输入模板名称', 'warning')
      return
    }

    try {
      const projectData = projectStore.getProjectData()
      
      templateStore.saveAsCustomTemplate(
        templateName.trim(),
        templateCategory,
        templateDescription.trim(),
        templateThumbnail,
        projectData,
        keepTapeReferences
      )

      showToast('模板保存成功！', 'success')
      dispatch('close')
    } catch (e) {
      console.error('Failed to save template:', e)
      showToast('保存模板失败', 'error')
    }
  }

  function selectCategory(catId: string) {
    templateCategory = catId as TemplateCategory
  }
</script>

<div class="modal-overlay" on:click={(e) => e.target === e.currentTarget && dispatch('close')}>
  <div class="modal-content animate-fadeIn">
    <div class="modal-header">
      <h2>⭐ 保存为模板</h2>
      <button class="close-btn" on:click={() => dispatch('close')}>✕</button>
    </div>
    
    <div class="modal-body">
      <div class="form-group">
        <label class="form-label">模板名称</label>
        <input 
          type="text" 
          class="input"
          bind:value={templateName}
          placeholder="给你的模板起个名字..."
          maxlength={50}
        />
      </div>
      
      <div class="form-group">
        <label class="form-label">模板分类</label>
        <div class="category-grid">
          {#each availableCategories as cat}
            <button 
              class="category-item {templateCategory === cat.id ? 'active' : ''}"
              style="--cat-color: {cat.color}"
              on:click={() => selectCategory(cat.id)}
            >
              <span class="cat-icon">{cat.icon}</span>
              <span class="cat-name">{cat.name}</span>
            </button>
          {/each}
        </div>
      </div>
      
      <div class="form-group">
        <label class="form-label">模板描述</label>
        <textarea 
          class="textarea"
          bind:value={templateDescription}
          placeholder="描述一下这个模板的适用场景..."
          rows={3}
          maxlength={200}
        />
      </div>
      
      <div class="form-group">
        <label class="form-label">选择图标</label>
        <div class="thumbnail-grid">
          {#each thumbnailOptions as icon}
            <button 
              class="thumbnail-item {templateThumbnail === icon ? 'active' : ''}"
              on:click={() => templateThumbnail = icon}
            >
              {icon}
            </button>
          {/each}
        </div>
      </div>
      
      <div class="form-group">
        <label class="checkbox-label">
          <input type="checkbox" bind:checked={keepTapeReferences} />
          <span>保留实际胶带素材引用</span>
          <span class="checkbox-hint">（取消则使用占位胶带，便于分享）</span>
        </label>
      </div>
    </div>
    
    <div class="modal-footer">
      <button class="btn btn-sm" on:click={() => dispatch('close')}>
        取消
      </button>
      <button class="btn btn-sm btn-primary" on:click={handleSave}>
        <span>💾</span> 保存模板
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
    max-width: 560px;
    max-height: 90vh;
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
      font-size: 22px;
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

  .modal-body {
    flex: 1;
    overflow-y: auto;
    padding: 24px;
  }

  .form-group {
    margin-bottom: 20px;
    
    &:last-child {
      margin-bottom: 0;
    }
  }

  .form-label {
    display: block;
    font-family: var(--font-hand);
    font-size: 15px;
    color: var(--text-primary);
    margin-bottom: 8px;
  }

  .input,
  .textarea {
    width: 100%;
    padding: 10px 14px;
    border: 2px solid var(--text-secondary);
    border-radius: var(--border-radius-md);
    background: var(--macaron-cream);
    font-family: var(--font-hand);
    font-size: 14px;
    color: var(--text-primary);
    transition: all var(--transition-fast);
    
    &:focus {
      outline: none;
      border-color: var(--macaron-pink);
      background: var(--macaron-white);
    }
  }

  .textarea {
    resize: vertical;
    min-height: 80px;
  }

  .category-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 8px;
  }

  .category-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 12px 8px;
    border: 2px solid var(--text-primary);
    border-radius: var(--border-radius-md);
    background: var(--macaron-white);
    cursor: pointer;
    transition: all var(--transition-fast);
    
    &:hover {
      background: var(--cat-color, var(--macaron-cream));
    }
    
    &.active {
      background: var(--cat-color, var(--macaron-pink));
      box-shadow: 2px 2px 0 var(--text-primary);
    }
    
    .cat-icon {
      font-size: 24px;
    }
    
    .cat-name {
      font-family: var(--font-hand);
      font-size: 12px;
      color: var(--text-primary);
    }
  }

  .thumbnail-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(44px, 1fr));
    gap: 8px;
  }

  .thumbnail-item {
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid var(--text-secondary);
    border-radius: var(--border-radius-sm);
    background: var(--macaron-cream);
    font-size: 24px;
    cursor: pointer;
    transition: all var(--transition-fast);
    
    &:hover {
      background: var(--macaron-white);
      transform: scale(1.1);
    }
    
    &.active {
      border-color: var(--macaron-pink);
      background: var(--macaron-pinkLight);
      box-shadow: 2px 2px 0 var(--text-primary);
    }
  }

  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    font-family: var(--font-hand);
    font-size: 14px;
    color: var(--text-primary);
    
    input[type="checkbox"] {
      width: 18px;
      height: 18px;
      cursor: pointer;
    }
    
    .checkbox-hint {
      font-size: 12px;
      color: var(--text-secondary);
      margin-left: 4px;
    }
  }

  .modal-footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 12px;
    padding: 16px 24px;
    border-top: 2px dashed var(--macaron-gray);
  }
</style>
