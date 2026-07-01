export type APIMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

export type APIRequest = {
  method: APIMethod
  endpoint: string
  headers?: Record<string, string>
  body?: any
  params?: Record<string, any>
}

export type APIResponse<T = any> = {
  success: boolean
  data?: T
  error?: string
  statusCode?: number
}

export type WorkflowTemplate = {
  id: string
  name: string
  description: string
  category: 'content-creation' | 'social-publishing' | 'analytics' | 'automation' | 'custom'
  thumbnail?: string
  nodes: any[]
  edges: any[]
  metadata?: Record<string, any>
  tags?: string[]
  author?: string
  version?: string
  createdAt?: string
}

export type PluginManifest = {
  id: string
  name: string
  version: string
  description: string
  author: string
  entry: string
  permissions?: string[]
  nodeTypes?: string[]
  icon?: string
}

export type Plugin = {
  manifest: PluginManifest
  instance: any
  enabled: boolean
}
