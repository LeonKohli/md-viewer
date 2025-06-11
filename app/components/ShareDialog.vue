<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Share Document</DialogTitle>
        <DialogDescription>
          Share your markdown document with others. The entire content is encoded in the URL.
        </DialogDescription>
      </DialogHeader>
      
      <div class="space-y-4">
        <!-- Compression Progress -->
        <div v-if="isCompressing" class="space-y-2">
          <div class="flex items-center justify-between text-sm">
            <span class="text-muted-foreground">{{ compressionStatus }}</span>
            <span class="font-mono text-xs">{{ compressionProgress }}%</span>
          </div>
          <div class="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              class="h-full bg-primary transition-all duration-300 ease-out"
              :style="{ width: `${compressionProgress}%` }"
            />
          </div>
        </div>
        
        <!-- URL Preview and Copy -->
        <div v-else-if="shareUrl" class="space-y-2">
          <Label>Shareable Link</Label>
          <div class="flex gap-2">
            <Input
              v-model="shareUrl"
              readonly
              class="font-mono text-xs"
              @click="selectAllText"
            />
            <Button
              size="sm"
              @click="copyLink"
              :disabled="copying"
              class="shrink-0"
            >
              <Icon v-if="!copied" name="lucide:copy" class="h-4 w-4" />
              <Icon v-else name="lucide:check" class="h-4 w-4" />
              <span class="ml-1.5">{{ copied ? 'Copied!' : 'Copy' }}</span>
            </Button>
          </div>
        </div>
        
        <!-- Size Warning -->
        <div v-if="!canShare && !isCompressing" class="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          <div class="flex items-start gap-2">
            <Icon name="lucide:alert-triangle" class="h-4 w-4 mt-0.5" />
            <div>
              <p class="font-medium">Document too large for URL sharing</p>
              <p class="text-xs mt-1">
                Your document exceeds {{ formatBytes(COMPRESSION_THRESHOLDS.LARGE_DOC_SIZE) }}. 
                Please use the Export feature for very large documents.
              </p>
            </div>
          </div>
        </div>
        
        <!-- Compression Error -->
        <div v-if="compressionError" class="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          <div class="flex items-start gap-2">
            <Icon name="lucide:x-circle" class="h-4 w-4 mt-0.5" />
            <div>
              <p class="font-medium">Compression failed</p>
              <p class="text-xs mt-1">{{ compressionError }}</p>
            </div>
          </div>
        </div>
        
        <!-- Share Options -->
        <div v-else-if="canShare && shareUrl && !isCompressing" class="space-y-3">
          <!-- QR Code -->
          <div v-if="showQR" class="flex justify-center p-4 bg-muted rounded-lg">
            <img :src="qrCodeUrl" alt="QR Code" class="w-48 h-48" />
          </div>
          
          <!-- Action Buttons -->
          <div class="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              @click="toggleQR"
              :disabled="generatingQR"
            >
              <Icon name="lucide:qr-code" class="h-4 w-4 mr-1.5" />
              {{ showQR ? 'Hide' : 'Show' }} QR Code
            </Button>
            
            <Button
              v-if="canUseWebShare"
              variant="outline"
              size="sm"
              @click="shareViaWeb"
            >
              <Icon name="lucide:share-2" class="h-4 w-4 mr-1.5" />
              Share
            </Button>
          </div>
          
          <!-- Stats -->
          <div class="text-xs text-muted-foreground space-y-1 pt-2 border-t">
            <div class="flex justify-between">
              <span>Original size:</span>
              <span class="font-mono">{{ formatBytes(originalSize) }}</span>
            </div>
            <div class="flex justify-between">
              <span>Compressed size:</span>
              <span class="font-mono">{{ formatBytes(compressedSize) }}</span>
            </div>
            <div class="flex justify-between">
              <span>Compression ratio:</span>
              <span class="font-mono text-green-600 dark:text-green-400">{{ compressionRatio }}%</span>
            </div>
            <div class="flex justify-between" v-if="compressionTime">
              <span>Compression time:</span>
              <span class="font-mono">{{ compressionTime }}ms</span>
            </div>
            <div class="flex justify-between" v-if="compressionMethod">
              <span>Method:</span>
              <span class="font-mono">{{ compressionMethod }}</span>
            </div>
          </div>
          
          <!-- Large Document Info -->
          <div v-if="isLargeDocument" class="rounded-md bg-amber-500/10 p-3 text-sm text-amber-600 dark:text-amber-400">
            <div class="flex items-start gap-2">
              <Icon name="lucide:info" class="h-4 w-4 mt-0.5" />
              <div>
                <p class="font-medium">Large document compressed</p>
                <p class="text-xs mt-1">
                  This document was compressed using advanced compression. 
                  Recipients need a modern browser to open it.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import type { CompressionProgress } from '~/utils/compression-advanced'

interface Props {
  modelValue: boolean
  content: string
  title?: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const { 
  generateShareURL, 
  generateQRCode, 
  copyToClipboard,
  shareViaWebAPI,
  trackShare,
  canShareViaURL,
  COMPRESSION_THRESHOLDS
} = useContentSharing()

// Dialog state
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// Share state
const shareUrl = ref('')
const qrCodeUrl = ref('')
const showQR = ref(false)
const copying = ref(false)
const copied = ref(false)
const generatingQR = ref(false)

// Compression state
const isCompressing = ref(false)
const compressionProgress = ref(0)
const compressionStatus = ref('Preparing...')
const compressionError = ref('')
const compressionTime = ref(0)
const compressionMethod = ref('')

// Size calculations
const originalSize = computed(() => new Blob([props.content]).size)
const compressedSize = computed(() => {
  if (!shareUrl.value) return 0
  // Extract just the compressed part (after #share/)
  const compressed = shareUrl.value.split('#share/')[1] || ''
  return new Blob([compressed]).size
})
const compressionRatio = computed(() => {
  if (originalSize.value === 0) return 0
  return Math.round((1 - compressedSize.value / originalSize.value) * 100)
})

// Check if content can be shared
const canShare = computed(() => canShareViaURL(props.content))

// Check if this is a large document
const isLargeDocument = computed(() => {
  return props.content.length > COMPRESSION_THRESHOLDS.SYNC_MAX_SIZE
})

// Check if Web Share API is available
const canUseWebShare = computed(() => {
  return typeof navigator !== 'undefined' && 'share' in navigator
})

// Handle compression progress
const handleCompressionProgress = (progress: CompressionProgress) => {
  compressionProgress.value = progress.progress
  
  switch (progress.status) {
    case 'compressing':
      compressionStatus.value = 'Compressing document...'
      break
    case 'encoding':
      compressionStatus.value = 'Encoding for URL...'
      break
    case 'done':
      compressionStatus.value = 'Complete!'
      break
    case 'error':
      compressionError.value = progress.message || 'Unknown error occurred'
      isCompressing.value = false
      break
  }
}

// Generate share URL when dialog opens or content changes
watchEffect(async () => {
  if (isOpen.value && props.content && canShare.value) {
    isCompressing.value = true
    compressionProgress.value = 0
    compressionError.value = ''
    shareUrl.value = ''
    const startTime = performance.now()
    
    try {
      const url = await generateShareURL(props.content, { 
        title: props.title,
        readOnly: true,
        onProgress: handleCompressionProgress
      })
      
      shareUrl.value = url
      compressionTime.value = Math.round(performance.now() - startTime)
      
      // Detect compression method
      compressionMethod.value = window.CompressionStream ? 'Native gzip' : 'Pako (fallback)'
      
      // Track the share
      trackShare(url)
      
      // Reset UI states
      showQR.value = false
      qrCodeUrl.value = ''
      copied.value = false
    } catch (error) {
      console.error('Failed to generate share URL:', error)
      compressionError.value = error instanceof Error ? error.message : 'Failed to compress document'
    } finally {
      isCompressing.value = false
    }
  } else if (isOpen.value && !canShare.value) {
    // Document is too large
    shareUrl.value = ''
    isCompressing.value = false
  }
})

// Copy link to clipboard
const copyLink = async () => {
  copying.value = true
  copied.value = false
  
  const success = await copyToClipboard(shareUrl.value)
  
  if (success) {
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  }
  
  copying.value = false
}

// Toggle QR code display
const toggleQR = async () => {
  if (showQR.value) {
    showQR.value = false
    return
  }
  
  if (!qrCodeUrl.value) {
    generatingQR.value = true
    try {
      qrCodeUrl.value = await generateQRCode(shareUrl.value)
    } catch (error) {
      console.error('Failed to generate QR code:', error)
    }
    generatingQR.value = false
  }
  
  showQR.value = true
}

// Share via Web Share API
const shareViaWeb = async () => {
  await shareViaWebAPI(shareUrl.value, props.title)
}

// Select all text in input
const selectAllText = (event: Event) => {
  const input = event.target as HTMLInputElement
  input.select()
}

// Format bytes to human readable
const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>