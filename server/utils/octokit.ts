import { Octokit } from 'octokit'
import type { H3Event } from 'h3'

/**
 * Create an authenticated Octokit instance for the current user
 */
export async function getUserOctokit(event: H3Event): Promise<Octokit> {
  const session = await requireUserSession(event)
  
  // Access token is now stored in the secure field
  if (!session.secure?.accessToken) {
    throw createError({
      statusCode: 401,
      statusMessage: 'GitHub authentication required'
    })
  }

  return new Octokit({
    auth: session.secure.accessToken,
    userAgent: 'markdown-editor/1.0.0',
    // Enable automatic retries for better reliability
    retry: {
      enabled: true,
      doNotRetry: [401, 403, 404, 422]
    },
    // Enable request throttling to avoid rate limits
    throttle: {
      onRateLimit: (retryAfter: number, options: { method: string; url: string }, octokit: Octokit, retryCount: number) => {
        octokit.log.warn(`Request quota exhausted for request ${options.method} ${options.url}`)
        
        if (retryCount < 1) {
          // Only retry once
          octokit.log.info(`Retrying after ${retryAfter} seconds!`)
          return true
        }
      },
      onSecondaryRateLimit: (retryAfter: number, options: { method: string; url: string }, octokit: Octokit) => {
        // Does not retry, only logs a warning
        octokit.log.warn(`SecondaryRateLimit detected for request ${options.method} ${options.url}`)
      }
    }
  })
}