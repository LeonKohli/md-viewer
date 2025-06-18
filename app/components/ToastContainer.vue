<template>
  <Teleport to="body">
    <div 
      v-if="toasts.length > 0"
      class="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 space-y-2"
    >
      <TransitionGroup
        name="toast"
        tag="div"
        class="space-y-2"
      >
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="[
            'flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg min-w-[300px] max-w-[500px]',
            getToastClass(toast.type)
          ]"
        >
          <Icon 
            :name="getToastIcon(toast.type)"
            class="w-5 h-5 flex-shrink-0"
          />
          <span class="flex-1 text-sm">{{ toast.message }}</span>
          
          <!-- Action button -->
          <Button
            v-if="toast.action"
            variant="ghost"
            size="sm"
            @click="handleAction(toast)"
            class="h-auto py-1 px-2 text-xs"
          >
            {{ toast.action.label }}
          </Button>
          
          <!-- Close button -->
          <Button
            variant="ghost"
            size="sm"
            @click="dismiss(toast.id)"
            class="h-6 w-6 p-0"
          >
            <Icon name="lucide:x" class="w-4 h-4" />
          </Button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
const { toasts, dismiss } = useToast()

const getToastClass = (type: string) => {
  switch (type) {
    case 'success':
      return 'bg-green-600 text-white'
    case 'error':
      return 'bg-destructive text-destructive-foreground'
    case 'warning':
      return 'bg-yellow-600 text-white'
    default:
      return 'bg-background text-foreground border'
  }
}

const getToastIcon = (type: string) => {
  switch (type) {
    case 'success':
      return 'lucide:check-circle'
    case 'error':
      return 'lucide:x-circle'
    case 'warning':
      return 'lucide:alert-triangle'
    default:
      return 'lucide:info'
  }
}

const handleAction = (toast: any) => {
  if (toast.action?.handler) {
    toast.action.handler()
  }
  dismiss(toast.id)
}
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  transform: translateY(100%);
  opacity: 0;
}

.toast-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.toast-move {
  transition: transform 0.3s ease;
}
</style>