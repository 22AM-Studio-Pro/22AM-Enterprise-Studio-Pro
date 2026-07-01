import { APIRequest, APIResponse, WorkflowTemplate } from './IntegrationTypes'

export class WorkflowAPI {
  private baseUrl: string
  private authToken?: string

  constructor(baseUrl: string, authToken?: string) {
    this.baseUrl = baseUrl
    this.authToken = authToken
  }

  setAuthToken(token: string) {
    this.authToken = token
  }

  private async request<T>(req: APIRequest): Promise<APIResponse<T>> {
    const url = new URL(req.endpoint, this.baseUrl)

    if (req.params) {
      Object.entries(req.params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value))
      })
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...req.headers
    }

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`
    }

    try {
      const response = await fetch(url.toString(), {
        method: req.method,
        headers,
        body: req.body ? JSON.stringify(req.body) : undefined
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: data.message || `HTTP ${response.status}`,
          statusCode: response.status
        }
      }

      return {
        success: true,
        data,
        statusCode: response.status
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  async saveWorkflow(workflowId: string, workflow: any): Promise<APIResponse> {
    return this.request({
      method: 'PUT',
      endpoint: `/workflows/${workflowId}`,
      body: workflow
    })
  }

  async loadWorkflow(workflowId: string): Promise<APIResponse> {
    return this.request({
      method: 'GET',
      endpoint: `/workflows/${workflowId}`
    })
  }

  async deleteWorkflow(workflowId: string): Promise<APIResponse> {
    return this.request({
      method: 'DELETE',
      endpoint: `/workflows/${workflowId}`
    })
  }

  async listWorkflows(): Promise<APIResponse> {
    return this.request({
      method: 'GET',
      endpoint: '/workflows'
    })
  }

  async executeWorkflow(workflowId: string, input?: any): Promise<APIResponse> {
    return this.request({
      method: 'POST',
      endpoint: `/workflows/${workflowId}/execute`,
      body: { input }
    })
  }

  async getExecutionStatus(executionId: string): Promise<APIResponse> {
    return this.request({
      method: 'GET',
      endpoint: `/executions/${executionId}`
    })
  }

  async getTemplates(category?: string): Promise<APIResponse<WorkflowTemplate[]>> {
    return this.request({
      method: 'GET',
      endpoint: '/templates',
      params: category ? { category } : undefined
    })
  }

  async getTemplate(templateId: string): Promise<APIResponse<WorkflowTemplate>> {
    return this.request({
      method: 'GET',
      endpoint: `/templates/${templateId}`
    })
  }

  async cloneTemplate(templateId: string, workflowName: string): Promise<APIResponse> {
    return this.request({
      method: 'POST',
      endpoint: `/templates/${templateId}/clone`,
      body: { name: workflowName }
    })
  }
}
