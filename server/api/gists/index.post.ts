// Create a new gist
import { getUserOctokit } from '../../utils/octokit'

export default defineEventHandler(async (event) => {
  try {
    const octokit = await getUserOctokit(event)
    const body = await readBody(event)
    
    // Validate request body
    if (!body.files || Object.keys(body.files).length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'At least one file is required'
      })
    }
    
    // Create gist using Octokit
    const { data } = await octokit.rest.gists.create({
      description: body.description || '',
      public: body.public !== false, // Default to public
      files: body.files
    })
    
    return data
  } catch (error: any) {
    throw createError({
      statusCode: error.status || 500,
      statusMessage: error.message || 'Failed to create gist'
    })
  }
})