import { ApplicationConfig, ProviderConfig, SharedConfig } from '../config/types'
import { ConfigurationManager } from '../config/ConfigurationManager'
import { SecretStore } from '../secrets/SecretStore'

export class SettingsManager {
  private configManager: ConfigurationManager
  private secretStore: SecretStore
  private settings: Map<string, any> = new Map()

  constructor(configPath: string, secretsPath: string) {
    this.configManager = new ConfigurationManager(configPath, secretsPath)
    this.secretStore = new SecretStore(secretsPath)
  }

  async initialize(): Promise<void> {
    await this.configManager.initialize()
    await this.secretStore.initialize()
  }

  // Provider Settings
  async setProviderConfig(provider: string, config: any): Promise<void> {
    const key = `providers.${provider}`
    this.settings.set(key, config)
    this.configManager.set(key, { ...config, apiKey: undefined })

    if (config.apiKey) {
      await this.secretStore.setSecret(`provider_${provider}_key`, config.apiKey)
    }

    await this.configManager.save()
  }

  getProviderConfig(provider: string): any {
    const config = this.configManager.get(`providers.${provider}`) || {}
    const apiKey = this.secretStore.getSecret(`provider_${provider}_key`)
    return { ...config, apiKey }
  }

  // Database Settings
  async setDatabaseConfig(dbConfig: any): Promise<void> {
    this.configManager.set('database', dbConfig)
    if (dbConfig.password) {
      await this.secretStore.setSecret('database_password', dbConfig.password)
      const safeConfig = { ...dbConfig, password: undefined }
      this.configManager.set('database', safeConfig)
    }
    await this.configManager.save()
  }

  getDatabaseConfig(): any {
    const config = this.configManager.get('database') || {}
    const password = this.secretStore.getSecret('database_password')
    return { ...config, password }
  }

  // Plugin Settings
  async setPluginConfig(pluginId: string, config: any): Promise<void> {
    const key = `plugins.${pluginId}`
    this.settings.set(key, config)
    this.configManager.set(key, config)
    await this.configManager.save()
  }

  getPluginConfig(pluginId: string): any {
    return this.configManager.get(`plugins.${pluginId}`) || {}
  }

  // Environment Settings
  getEnvironmentConfig(): Partial<ApplicationConfig> {
    return {
      environment: this.configManager.get('environment'),
      logLevel: this.configManager.get('logLevel'),
      debugMode: this.configManager.get('debugMode')
    }
  }

  // Export Settings (without secrets)
  async exportSettings(): Promise<string> {
    const publicConfig = this.configManager.getPublicConfig()
    return JSON.stringify(publicConfig, null, 2)
  }

  // Import Settings
  async importSettings(json: string): Promise<void> {
    try {
      const config = JSON.parse(json)
      this.configManager.set('features', config.features)
      this.configManager.set('services', config.services)
      this.configManager.set('customSettings', config.customSettings)
      await this.configManager.save()
    } catch (error) {
      throw new Error(`Failed to import settings: ${error}`)
    }
  }

  // Generic Settings
  getSetting(key: string): any {
    return this.configManager.get(key)
  }

  async setSetting(key: string, value: any): Promise<void> {
    this.settings.set(key, value)
    this.configManager.set(key, value)
    await this.configManager.save()
  }

  // Validation
  validateSettings(): string[] {
    const errors: string[] = []

    // Check required provider keys if enabled
    const aiEnabled = this.configManager.get('features.aiIntegration')
    if (aiEnabled) {
      const openaiKey = this.secretStore.getSecret('provider_openai_key')
      if (!openaiKey) errors.push('OpenAI API key not configured')
    }

    // Check database
    const dbConfig = this.getDatabaseConfig()
    if (dbConfig.type === 'postgres' && !dbConfig.url) {
      errors.push('PostgreSQL connection URL required')
    }

    return errors
  }
}
