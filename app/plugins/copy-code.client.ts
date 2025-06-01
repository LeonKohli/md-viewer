import { useClipboard } from '@vueuse/core'

export default defineNuxtPlugin(() => {
  // Use VueUse's clipboard composable for better browser compatibility
  const { copy, copied, isSupported } = useClipboard()
  
  if (process.client && isSupported.value) {
    document.addEventListener('click', async (e) => {
      const target = e.target as HTMLElement
      if (target.classList.contains('code-copy-btn')) {
        const codeId = target.getAttribute('data-target')
        if (codeId) {
          const codeEl = document.getElementById(codeId)
          if (codeEl) {
            const code = codeEl.textContent || ''
            await copy(code)
            
            // Update button text based on copied state
            target.textContent = 'Copied!'
            setTimeout(() => {
              target.textContent = 'Copy'
            }, 2000)
          }
        }
      }
    })
  }
})