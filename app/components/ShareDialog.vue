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
        <!-- URL Preview and Copy -->
        <div v-if="shareUrl" class="space-y-2">
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
        <div v-if="!canShare" class="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          <div class="flex items-start gap-2">
            <Icon name="lucide:alert-triangle" class="h-4 w-4 mt-0.5" />
            <div>
              <p class="font-medium">Document too large for URL sharing</p>
              <p class="text-xs mt-1">
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
        <div v-else-if="canShare && shareUrl" class="space-y-3">
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
              :disabled="generatingQR || shareUrl.length > 2953"
              :title="shareUrl.length > 2953 ? 'URL too long for QR code' : ''"
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
          
          <!-- Stats (Collapsible) -->
          <div class="pt-2 border-t">
            <button
              @click="showTechnicalInfo = !showTechnicalInfo"
              class="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors w-full"
            >
              <Icon 
                :name="showTechnicalInfo ? 'lucide:chevron-down' : 'lucide:chevron-right'" 
                class="h-3 w-3"
              />
              <span>Technical details</span>
            </button>
            
            <div v-if="showTechnicalInfo" class="text-xs text-muted-foreground space-y-1 mt-2">
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
              <div v-if="shareUrl.length > 2953" class="flex items-center gap-1 text-amber-600 dark:text-amber-400 mt-2">
                <Icon name="lucide:info" class="h-3 w-3" />
                <span>URL too long for QR code</span>
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
  canShareViaURL
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
const compressionError = ref('')
const compressionTime = ref(0)
const compressionMethod = ref('')

// UI state
const showTechnicalInfo = ref(false)

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

// Check if Web Share API is available
const canUseWebShare = computed(() => {
  return typeof navigator !== 'undefined' && 'share' in navigator
})

// Generate share URL when dialog opens or content changes
watchEffect(async () => {
  if (isOpen.value && props.content && canShare.value) {
    compressionError.value = ''
    shareUrl.value = ''
    const startTime = performance.now()
    
    try {
      const url = await generateShareURL(props.content, { 
        title: props.title,
        readOnly: true
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
      showTechnicalInfo.value = false
    } catch (error) {
      console.error('Failed to generate share URL:', error)
      compressionError.value = error instanceof Error ? error.message : 'Failed to compress document'
    }
  } else if (isOpen.value && !canShare.value) {
    // Document is too large
    shareUrl.value = ''
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
  
  // Check if URL is too long for QR code
  if (shareUrl.value.length > 2953) {
    console.warn('URL too long for QR code generation')
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