import { App } from 'vue'

/**
 * 去除输入框首尾空格的指令
 */
export const trimDirective = {
  mounted(el: HTMLElement) {
    const input = el.querySelector('input') || el.querySelector('textarea')
    if (input) {
      input.addEventListener('blur', function() {
        this.value = this.value.trim()
        this.dispatchEvent(new Event('input'))
      })
    }
  }
}

/**
 * 数字输入指令 - 只允许输入数字
 */
export const numberDirective = {
  mounted(el: HTMLElement) {
    const input = el.querySelector('input') || el
    if (input && input.tagName === 'INPUT') {
      input.addEventListener('input', function(this: HTMLInputElement) {
        this.value = this.value.replace(/[^\d]/g, '')
        this.dispatchEvent(new Event('input'))
      })
    }
  }
}

/**
 * 限制输入长度指令
 */
export const maxlengthDirective = {
  mounted(el: HTMLElement, binding: any) {
    const maxLength = binding.value
    const input = el.querySelector('input') || el.querySelector('textarea') || el
    
    if (input && input.tagName === 'INPUT' || input.tagName === 'TEXTAREA') {
      input.addEventListener('input', function(this: HTMLInputElement) {
        if (this.value.length > maxLength) {
          this.value = this.value.slice(0, maxLength)
          this.dispatchEvent(new Event('input'))
        }
      })
    }
  }
}

/**
 * 权限指令 - 根据权限控制元素显示
 */
export const permissionDirective = {
  mounted(el: HTMLElement, binding: any) {
    const permission = binding.value
    const permissions = JSON.parse(localStorage.getItem('permissions') || '[]')
    
    // 如果没有权限，隐藏元素
    if (!permissions.includes(permission) && !permissions.includes('*')) {
      el.style.display = 'none'
    }
  }
}

/**
 * 点击外部指令 - 点击元素外部时触发回调
 */
export const clickOutsideDirective = {
  mounted(el: HTMLElement, binding: any) {
    el.clickOutsideEvent = function(event: Event) {
      if (!(el === event.target || el.contains(event.target as Node))) {
        binding.value(event)
      }
    }
    document.addEventListener('click', el.clickOutsideEvent)
  },
  unmounted(el: HTMLElement) {
    document.removeEventListener('click', el.clickOutsideEvent)
  }
}

/**
 * 防抖指令 - 防止频繁触发
 */
export const debounceDirective = {
  mounted(el: HTMLElement, binding: any) {
    const { value, arg = 300 } = binding
    let timeout: NodeJS.Timeout | null = null
    
    el.debounceEvent = function(event: Event) {
      if (timeout) clearTimeout(timeout)
      timeout = setTimeout(() => {
        value(event)
      }, arg)
    }
    
    el.addEventListener('click', el.debounceEvent)
  },
  unmounted(el: HTMLElement) {
    if (el.debounceEvent) {
      el.removeEventListener('click', el.debounceEvent)
    }
  }
}

/**
 * 节流指令 - 限制触发频率
 */
export const throttleDirective = {
  mounted(el: HTMLElement, binding: any) {
    const { value, arg = 1000 } = binding
    let lastTime = 0
    
    el.throttleEvent = function(event: Event) {
      const now = Date.now()
      if (now - lastTime >= arg) {
        value(event)
        lastTime = now
      }
    }
    
    el.addEventListener('click', el.throttleEvent)
  },
  unmounted(el: HTMLElement) {
    if (el.throttleEvent) {
      el.removeEventListener('click', el.throttleEvent)
    }
  }
}

/**
 * 拖拽指令 - 使元素可拖拽
 */
export const draggableDirective = {
  mounted(el: HTMLElement, binding: any) {
    const options = binding.value || {}
    const { onStart, onDrag, onEnd } = options
    
    let isDragging = false
    let startX = 0
    let startY = 0
    let currentX = 0
    let currentY = 0
    
    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true
      startX = e.clientX - currentX
      startY = e.clientY - currentY
      
      if (onStart) onStart(e)
      
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      
      el.style.cursor = 'grabbing'
      el.style.userSelect = 'none'
    }
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return
      
      currentX = e.clientX - startX
      currentY = e.clientY - startY
      
      el.style.transform = `translate(${currentX}px, ${currentY}px)`
      
      if (onDrag) onDrag(e, currentX, currentY)
    }
    
    const handleMouseUp = (e: MouseEvent) => {
      isDragging = false
      
      if (onEnd) onEnd(e)
      
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      
      el.style.cursor = 'grab'
      el.style.userSelect = ''
    }
    
    el.addEventListener('mousedown', handleMouseDown)
    el.draggable = false
  }
}

/**
 * 注册所有自定义指令
 */
export function registerDirectives(app: App) {
  app.directive('trim', trimDirective)
  app.directive('number', numberDirective)
  app.directive('maxlength', maxlengthDirective)
  app.directive('permission', permissionDirective)
  app.directive('click-outside', clickOutsideDirective)
  app.directive('debounce', debounceDirective)
  app.directive('throttle', throttleDirective)
  app.directive('draggable', draggableDirective)
}