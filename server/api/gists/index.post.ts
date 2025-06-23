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
      public: body.public === true, // Default to private - require explicit opt-in for public
      files: body.files
    })
    
    return data
  } catch (error) {
    const status = (error as any).status || 500
    const message = error instanceof Error ? error.message : 'Failed to create gist'
    throw createError({
      statusCode: status,
      statusMessage: message
    })
  }
})