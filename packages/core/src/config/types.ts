export type SharedConfig = {
  // Core
  environment: 'development' | 'production' | 'test'
  logLevel: 'debug' | 'info' | 'warn' | 'error'
  debugMode: boolean

  // Database
  database: {
    type: 'sqlite' | 'postgres'
    path?: string
    url?: string
    migrations: boolean
  }

  // Features
  features: {
    workflowDesigner: boolean
    aiIntegration: boolean
    contentPipeline: boolean
    assetManagement: boolean
    publishing: boolean
  }

  // Services
  services: {
    workflowEngine: boolean
    contentPipeline: boolean
    assetManager: boolean
    publishingFramework: boolean
  }
}

export type ProviderConfig = {
  openai?: {
    enabled: boolean
    apiKey?: string
    defaultModel?: string
  }
  gemini?: {
    enabled: boolean
    apiKey?: string
  }
  elevenLabs?: {
    enabled: boolean
    apiKey?: string
  }
}

export type ApplicationConfig = SharedConfig & {
  providers: ProviderConfig
  plugins: Record<string, any>
  customSettings: Record<string, any>
}
