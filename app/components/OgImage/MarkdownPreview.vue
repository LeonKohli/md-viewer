<script setup lang="ts">
// Custom OG image template for Markdown Preview site
withDefaults(defineProps<{
  title?: string
  description?: string
  colorMode?: 'light' | 'dark'
}>(), {
  title: 'Markdown Preview',
  description: 'Live preview and edit your Markdown files with syntax highlighting',
  colorMode: 'dark'
})
</script>

<template>
  <div class="w-full h-full flex items-center justify-center" style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); position: relative; overflow: hidden;">
    <!-- Background decoration -->
    <div style="position: absolute; top: -100px; right: -100px; width: 300px; height: 300px; background: radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%); border-radius: 50%;"></div>
    <div style="position: absolute; bottom: -150px; left: -150px; width: 400px; height: 400px; background: radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%); border-radius: 50%;"></div>
    
    <!-- Central content -->
    <div class="flex flex-col items-center text-center" style="padding: 60px; position: relative; z-index: 10;">
      <!-- Logo -->
      <img 
        src="/icon.png" 
        alt="Markdown Preview Logo"
        style="width: 120px; height: 120px; margin-bottom: 40px; filter: drop-shadow(0 10px 30px rgba(0, 0, 0, 0.3));"
      />
      
      <!-- Title -->
      <h1 style="font-size: 72px; font-weight: 800; color: #ffffff; margin-bottom: 24px; line-height: 1; letter-spacing: -2px;">
        {{ title }}
      </h1>
      
      <!-- Description -->
      <p style="font-size: 28px; color: #94a3b8; margin-bottom: 48px; max-width: 800px; line-height: 1.4;">
        {{ description }}
      </p>
      
      <!-- URL/branding -->
      <div style="font-size: 18px; color: #64748b; font-family: monospace; opacity: 0.8;">
        md-viewer • Open Source Markdown Editor
      </div>
    </div>
  </div>
</template>