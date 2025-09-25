<script setup lang="ts">
definePageMeta({
  middleware: 'guest'
})

const route = useRoute()
const error = ref('')

// Check for OAuth error in query params
onMounted(() => {
  if (route.query.error === 'oauth_failed') {
    error.value = 'GitHub authentication failed. Please try again.'
  }
})

const loginWithGitHub = () => {
  // Redirect to GitHub OAuth endpoint
  window.location.href = '/auth/github'
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center">
    <Card class="w-full max-w-sm">
      <CardHeader class="text-center">
        <CardTitle>Welcome to Markdown Editor</CardTitle>
        <CardDescription>Sign in to access your GitHub Gists</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          <Alert v-if="error" variant="destructive">
            <AlertDescription>{{ error }}</AlertDescription>
          </Alert>

          <Button
            @click="loginWithGitHub"
            class="w-full"
            size="lg"
          >
            <Icon name="mdi:github" class="mr-2 h-5 w-5" />
            Sign in with GitHub
          </Button>

          <div class="text-center text-sm text-muted-foreground">
            <p>Sign in to save and sync your markdown files with GitHub Gists</p>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>