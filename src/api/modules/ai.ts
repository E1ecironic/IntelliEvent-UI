import request from './request'
import type { ApiResponse } from '@/types/api'

export interface AiStructuredPlanRequest {
  provider?: string
  model?: string
  temperature?: number
  maxTokens?: number
  timeoutMs?: number
  name?: string
  type?: string
  date?: string
  location?: string
  participants?: number
  budget?: number
  description?: string
  prompt?: string
}

export interface AiStructuredPlanResponse {
  name?: string
  type?: string
  date?: string
  timeRange?: string
  location?: string
  participants?: number
  budget?: number
  description?: string
  agenda?: string[]
  materials?: string[]
  parseSuccess?: boolean
  rawText?: string
  contextId?: string
}

const aiApi = {
  generateStructuredPlan: async (params: AiStructuredPlanRequest): Promise<ApiResponse<AiStructuredPlanResponse>> => {
    return await request.post('/ai/plan/structured', params)
  }
}

export default aiApi
