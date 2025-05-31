export default defineNuxtPlugin(() => {
  // Simple event delegation for copy buttons
  if (process.client) {
    document.addEventListener('click', async (e) => {
      const target = e.target as HTMLElement
      if (target.classList.contains('code-copy-btn')) {
        const codeId = target.getAttribute('data-target')
        if (codeId) {
          const codeEl = document.getElementById(codeId)
          if (codeEl) {
            try {
              const code = codeEl.textContent || ''
              await navigator.clipboard.writeText(code)
              target.textContent = 'Copied!'
              setTimeout(() => {
                target.textContent = 'Copy'
              }, 2000)
            } catch (err) {
              console.error('Copy failed:', err)
              target.textContent = 'Failed'
              setTimeout(() => {
                target.textContent = 'Copy'
              }, 2000)
            }
          }
        }
      }
    })
  }
})