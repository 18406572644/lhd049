<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import type { Template } from '@/types'
  import { TEMPLATE_CATEGORIES } from '@/types'

  export let template: Template

  const dispatch = createEventDispatcher()

  const categoryInfo = TEMPLATE_CATEGORIES.find(c => c.id === template.category)

  const elementCount = template.data.elements.length

  function handleUseTemplate() {
    dispatch('use', template)
  }

  function handleDelete() {
    dispatch('delete', template)
  }
</script>

<div class="template-card">
  <div class="card-thumbnail" style="background-color: {template.data.backgroundColor}">
    <div class="thumbnail-content">
      <span class="thumbnail-icon">{template.thumbnail}</span>
      {#if elementCount > 0}
        <span class="element-badge">{elementCount} 个元素</span>
      {/if}
    </div>
    <div class="category-badge" style="background: {categoryInfo?.color}">
      {categoryInfo?.icon} {categoryInfo?.name}
    </div>
    {#if template.isBuiltin}
      <div class="builtin-badge">官方</div>
    {/if}
  </div>
  
  <div class="card-info">
    <h4 class="template-name">{template.name}</h4>
    <p class="template-description">{template.description}</p>
    <div class="template-meta">
      <span class="meta-item">📐 {template.data.canvasWidth}×{template.data.canvasHeight}</span>
    </div>
  </div>
  
  <div class="card-actions">
    <button class="btn btn-sm btn-primary" on:click={handleUseTemplate}>
      <span>✨</span> 使用模板
    </button>
    {#if !template.isBuiltin}
      <button class="btn btn-sm btn-danger" on:click={handleDelete}>
        <span>🗑️</span> 删除
      </button>
    {/if}
  </div>
</div>

<style lang="scss">
  .template-card {
    background: var(--macaron-white);
    border: 2px solid var(--text-primary);
    border-radius: var(--border-radius-lg);
    overflow: hidden;
    transition: all var(--transition-fast);
    display: flex;
    flex-direction: column;
    
    &:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-md);
    }
  }

  .card-thumbnail {
    position: relative;
    height: 160px;
    border-bottom: 2px dashed var(--macaron-gray);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    
    &::before {
      content: '';
      position: absolute;
      inset: 10px;
      border: 2px dashed rgba(93, 78, 94, 0.2);
      border-radius: var(--border-radius-md);
      pointer-events: none;
    }
  }

  .thumbnail-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }

  .thumbnail-icon {
    font-size: 56px;
    filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.1));
  }

  .element-badge {
    padding: 4px 12px;
    background: rgba(255, 255, 255, 0.9);
    border: 1px solid var(--text-primary);
    border-radius: 20px;
    font-family: var(--font-hand);
    font-size: 12px;
    color: var(--text-primary);
  }

  .category-badge {
    position: absolute;
    top: 10px;
    left: 10px;
    padding: 4px 10px;
    border-radius: 12px;
    font-family: var(--font-hand);
    font-size: 11px;
    color: var(--text-primary);
    border: 1px solid var(--text-primary);
  }

  .builtin-badge {
    position: absolute;
    top: 10px;
    right: 10px;
    padding: 4px 10px;
    background: var(--macaron-yellow);
    border: 1px solid var(--text-primary);
    border-radius: 12px;
    font-family: var(--font-hand);
    font-size: 11px;
    color: var(--text-primary);
  }

  .card-info {
    padding: 12px 14px;
    flex: 1;
  }

  .template-name {
    font-family: var(--font-hand);
    font-size: 16px;
    color: var(--text-primary);
    margin-bottom: 6px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .template-description {
    font-size: 12px;
    color: var(--text-secondary);
    margin-bottom: 8px;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .template-meta {
    display: flex;
    gap: 12px;
  }

  .meta-item {
    font-size: 11px;
    color: var(--text-light);
  }

  .card-actions {
    padding: 10px 14px;
    border-top: 2px dashed var(--macaron-gray);
    display: flex;
    gap: 8px;
    background: var(--macaron-cream);
  }

  .btn {
    flex: 1;
    justify-content: center;
  }
</style>
