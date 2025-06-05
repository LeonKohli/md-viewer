import { ref, onMounted, type Ref } from 'vue'
import { useEventListener } from '@vueuse/core'
import 'vim.js/build/vim.js'

export function useVimMode(textarea: Ref<HTMLTextAreaElement | undefined>) {
  const mode = ref<'insert' | 'normal' | 'visual'>('insert')
  let app: any

  const updateMode = () => {
    if (!app) return
    const current = app.vim?.currentMode
    switch (current) {
      case 'general_mode':
        mode.value = 'normal'
        break
      case 'visual_mode':
        mode.value = 'visual'
        break
      default:
        mode.value = 'insert'
    }
  }

  onMounted(() => {
    if (typeof window !== 'undefined' && (window as any).vim) {
      app = (window as any).vim.open({ debug: false })
      updateMode()
    }
  })

  useEventListener(textarea, 'keydown', () => {
    requestAnimationFrame(updateMode)
  })
  useEventListener(textarea, 'click', updateMode)
  useEventListener(textarea, 'focus', updateMode)

  return { mode }
}
