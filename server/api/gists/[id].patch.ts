// Update a gist
import { getUserOctokit } from '../../utils/octokit'

export default defineEventHandler(async (event) => {
  try {
    const octokit = await getUserOctokit(event)
    const gistId = getRouterParam(event, 'id')
    const body = await readBody(event)
    
    if (!gistId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Gist ID is required'
      })
    }
    
    // Validate that at least one field is being updated
    if (!body.description && !body.files) {
      throw createError({
        statusCode: 400,
        statusMessage: 'At least description or files must be provided'
      })
    }
    
    // Build update payload - only include fields that are provided
    const updatePayload = {
      gist_id: gistId,
      ...(body.description !== undefined && { description: body.description }),
      ...(body.files && { files: body.files })
    }
    
    // Update gist using Octokit
    const { data } = await octokit.rest.gists.update(updatePayload)
    
    return data
  } catch (error) {
    const status = (error as any).status || 500
    const message = error instanceof Error ? error.message : 'Failed to update gist'
    throw createError({
      statusCode: status,
      statusMessage: message
    })
  }
})