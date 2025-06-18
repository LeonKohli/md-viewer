# Using the Toast Composable

The `useToast` composable provides a simple and flexible way to show toast notifications throughout the application.

## Basic Usage

```typescript
const toast = useToast()

// Success toast
toast.success('File saved successfully')

// Error toast
toast.error('Failed to save file')

// Info toast
toast.info('Processing your request...')

// Warning toast
toast.warning('Your session is about to expire')
```

## Advanced Usage

### Custom Duration

```typescript
// Show toast for 10 seconds (default is 3 seconds)
toast.info('This message will stay longer', { duration: 10000 })

// Persistent toast (won't auto-dismiss)
toast.error('Critical error occurred', { duration: 0 })
```

### Toast with Action

```typescript
toast.show('File deleted', {
  type: 'info',
  action: {
    label: 'Undo',
    handler: () => {
      // Restore the file
      toast.success('File restored')
    }
  }
})
```

### Promise-based Toast

Perfect for async operations:

```typescript
// Automatically shows loading, success, and error states
await toast.promise(
  saveGist(gistData),
  {
    loading: 'Saving gist...',
    success: 'Gist saved successfully!',
    error: 'Failed to save gist'
  }
)

// With dynamic messages
await toast.promise(
  fetchUserData(userId),
  {
    loading: 'Loading user data...',
    success: (data) => `Welcome back, ${data.name}!`,
    error: (err) => `Error: ${err.message}`
  }
)
```

## Migration from Console.log

Replace console.log statements with appropriate toast notifications:

```typescript
// Before
console.log('Gist saved successfully')
console.error('Failed to save gist:', error)

// After
toast.success('Gist saved successfully')
toast.error('Failed to save gist')
```

## Best Practices

1. **Choose the right type**: Use success for completed actions, error for failures, info for neutral messages, and warning for cautions.

2. **Keep messages concise**: Toast messages should be brief and clear.

3. **Provide actions when helpful**: For reversible actions, provide an undo option.

4. **Use promise toast for async operations**: This provides better UX with loading states.

5. **Don't overuse**: Too many toasts can be overwhelming. Use them for important user feedback.

## Toast Queue

Multiple toasts are automatically queued and displayed in order:

```typescript
toast.info('First message')
toast.success('Second message')
toast.error('Third message')
```

## Dismiss Toasts

```typescript
// Dismiss a specific toast
const toastId = toast.info('Processing...')
toast.dismiss(toastId)

// Dismiss all toasts
toast.dismissAll()
```

## TypeScript Support

The composable is fully typed:

```typescript
import type { ToastType, ToastOptions } from '~/composables/useToast'

const showCustomToast = (message: string, options: ToastOptions) => {
  toast.show(message, options)
}
```