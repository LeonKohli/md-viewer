// Delete a gist
import { getUserOctokit } from '../../utils/octokit'

export default defineEventHandler(async (event) => {
  try {
    const octokit = await getUserOctokit(event)
    const gistId = getRouterParam(event, 'id')
    
    if (!gistId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Gist ID is required'
      })
    }
    
    // Delete gist using Octokit
    await octokit.rest.gists.delete({
      gist_id: gistId
    })
    
    // Return success response
    return { success: true }
  } catch (error) {
    const status = (error as any).status || 500
    const message = error instanceof Error ? error.message : 'Failed to delete gist'
    throw createError({
      statusCode: status,
      statusMessage: message
    })
  }
})