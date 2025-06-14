import { Octokit } from 'octokit'
import type { H3Event } from 'h3'

/**
 * Create an authenticated Octokit instance for the current user
 */
export async function getUserOctokit(event: H3Event): Promise<Octokit> {
  const session = await requireUserSession(event)
  
  if (!session.user?.accessToken) {
    throw createError({
      statusCode: 401,
      statusMessage: 'GitHub authentication required'
    })
  }

  return new Octokit({
    auth: session.user.accessToken,
    userAgent: 'markdown-editor/1.0.0',
    // Enable automatic retries for better reliability
    retry: {
      enabled: true,
      doNotRetry: [401, 403, 404, 422]
    },
    // Enable request throttling to avoid rate limits
    throttle: {
      onRateLimit: (retryAfter, options, octokit, retryCount) => {
        octokit.log.warn(`Request quota exhausted for request ${options.method} ${options.url}`)
        
        if (retryCount < 1) {
          // Only retry once
          octokit.log.info(`Retrying after ${retryAfter} seconds!`)
          return true
        }
      },
      onSecondaryRateLimit: (retryAfter, options, octokit) => {
        // Does not retry, only logs a warning
        octokit.log.warn(`SecondaryRateLimit detected for request ${options.method} ${options.url}`)
      }
    }
  })
}