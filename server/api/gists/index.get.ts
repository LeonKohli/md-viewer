// List user's gists
import { getUserOctokit } from '../../utils/octokit'

export default defineEventHandler(async (event) => {
  try {
    const octokit = await getUserOctokit(event)
    const query = getQuery(event)
    
    // Fetch gists using Octokit
    const { data } = await octokit.rest.gists.list({
      page: Number(query.page) || 1,
      per_page: Number(query.per_page) || 30
    })
    
    return data
  } catch (error: any) {
    // Octokit provides better error messages
    throw createError({
      statusCode: error.status || 500,
      statusMessage: error.message || 'Failed to fetch gists'
    })
  }
})