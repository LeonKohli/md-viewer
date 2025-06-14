// Get a specific gist
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
    
    // Get gist using Octokit
    const { data } = await octokit.rest.gists.get({
      gist_id: gistId
    })
    
    return data
  } catch (error: any) {
    throw createError({
      statusCode: error.status || 500,
      statusMessage: error.message || 'Failed to fetch gist'
    })
  }
})