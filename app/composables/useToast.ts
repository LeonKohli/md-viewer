// Toast types
export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id: string
  message: string
  type: ToastType
  duration?: number
  action?: {
    label: string
    handler: () => void
  }
}

export interface ToastOptions {
  type?: ToastType
  duration?: number
  action?: Toast['action']
}

// Default toast duration in milliseconds
const DEFAULT_DURATION = 3000

export const useToast = () => {
  // Global toast state - persists across components
  const toasts = useState<Toast[]>('toasts', () => [])
  const timeouts = useState<Map<string, NodeJS.Timeout>>('toastTimeouts', () => new Map())

  /**
   * Show a toast notification
   */
  const show = (message: string, options: ToastOptions = {}) => {
    const {
      type = 'info',
      duration = DEFAULT_DURATION,
      action
    } = options

    const toast: Toast = {
      id: `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      message,
      type,
      duration,
      action
    }

    // Add toast to the queue
    toasts.value = [...toasts.value, toast]

    // Auto-dismiss after duration (unless duration is 0 which means persistent)
    if (duration > 0) {
      const timeout = setTimeout(() => {
        dismiss(toast.id)
      }, duration)
      
      timeouts.value.set(toast.id, timeout)
    }

    return toast.id
  }

  /**
   * Dismiss a specific toast
   */
  const dismiss = (id: string) => {
    // Clear timeout if exists
    const timeout = timeouts.value.get(id)
    if (timeout) {
      clearTimeout(timeout)
      timeouts.value.delete(id)
    }

    // Remove toast from queue
    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  /**
   * Dismiss all toasts
   */
  const dismissAll = () => {
    // Clear all timeouts
    timeouts.value.forEach(timeout => clearTimeout(timeout))
    timeouts.value.clear()

    // Clear all toasts
    toasts.value = []
  }

  /**
   * Convenience methods for different toast types
   */
  const success = (message: string, options?: Omit<ToastOptions, 'type'>) => {
    return show(message, { ...options, type: 'success' })
  }

  const error = (message: string, options?: Omit<ToastOptions, 'type'>) => {
    return show(message, { 
      ...options, 
      type: 'error',
      duration: options?.duration ?? 5000 // Errors stay longer by default
    })
  }

  const info = (message: string, options?: Omit<ToastOptions, 'type'>) => {
    return show(message, { ...options, type: 'info' })
  }

  const warning = (message: string, options?: Omit<ToastOptions, 'type'>) => {
    return show(message, { ...options, type: 'warning' })
  }

  /**
   * Promise-based toast for async operations
   */
  const promise = async <T>(
    promise: Promise<T>,
    messages: {
      loading?: string
      success?: string | ((data: T) => string)
      error?: string | ((error: any) => string)
    }
  ): Promise<T> => {
    const loadingId = messages.loading 
      ? show(messages.loading, { type: 'info', duration: 0 }) 
      : null

    try {
      const result = await promise
      
      if (loadingId) dismiss(loadingId)
      
      if (messages.success) {
        const successMessage = typeof messages.success === 'function' 
          ? messages.success(result) 
          : messages.success
        success(successMessage)
      }
      
      return result
    } catch (err) {
      if (loadingId) dismiss(loadingId)
      
      if (messages.error) {
        const errorMessage = typeof messages.error === 'function' 
          ? messages.error(err) 
          : messages.error
        error(errorMessage)
      }
      
      throw err
    }
  }

  return {
    // State
    toasts: readonly(toasts),
    
    // Methods
    show,
    dismiss,
    dismissAll,
    
    // Convenience methods
    success,
    error,
    info,
    warning,
    promise
  }
}