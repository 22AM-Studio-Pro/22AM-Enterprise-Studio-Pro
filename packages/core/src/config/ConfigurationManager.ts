import fs from 'fs-extra'
import path from 'path'
import { ApplicationConfig, ProviderConfig, SharedConfig } from './types'

export class ConfigurationManager {
  private config: ApplicationConfig
  private configPath: string
  private secretsPath: string

  constructor(configPath: string = './config', secretsPath: string = './secrets') {
    this.configPath = configPath
    this.secretsPath = secretsPath
    this.config = this.loadDefaultConfig()
  }

  async initialize(): Promise<void> {
    // Load config from file
    const configFile = path.join(this.configPath, 'config.json')
    if (fs.existsSync(configFile)) {
      const fileConfig = fs.readJsonSync(configFile)
      this.config = this.mergeConfig(this.config, fileConfig)
    }

    // Load environment overrides
    this.config = this.loadEnvironmentConfig(this.config)

    // Load secrets
    const secrets = await this.loadSecrets()
    this.applySecrets(secrets)
  }

  get(key: string): any {
    const keys = key.split('.')
    let value: any = this.config

    for (const k of keys) {
      value = value?.[k]
    }

    return value
  }

  set(key: string, value: any): void {
    const keys = key.split('.')
    let current = this.config

    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i]
      if (!current[k]) current[k] = {}
      current = current[k]
    }

    current[keys[keys.length - 1]] = value
  }

  async save(): Promise<void> {
    const configFile = path.join(this.configPath, 'config.json')
    await fs.ensureDir(this.configPath)
    await fs.writeJson(configFile, this.getPublicConfig(), { spaces: 2 })
  }

  getPublicConfig(): Partial<ApplicationConfig> {
    // Return config without secrets
    const { providers, ...publicConfig } = this.config
    return {
      ...publicConfig,
      providers: {
        ...providers,
        openai: { ...providers.openai, apiKey: undefined },
        gemini: { ...providers.gemini, apiKey: undefined },
        elevenLabs: { ...providers.elevenLabs, apiKey: undefined }
      }
    }
  }

  private loadDefaultConfig(): ApplicationConfig {
    return {
      environment: process.env.NODE_ENV as any || 'development',
      logLevel: 'info',
      debugMode: false,
      database: {
        type: 'sqlite',
        path: './data/app.db',
        migrations: true
      },
      features: {
        workflowDesigner: true,
        aiIntegration: true,
        contentPipeline: true,
        assetManagement: true,
        publishing: true
      },
      services: {
        workflowEngine: true,
        contentPipeline: true,
        assetManager: true,
        publishingFramework: true
      },
      providers: {},
      plugins: {},
      customSettings: {}
    }
  }

  private loadEnvironmentConfig(config: ApplicationConfig): ApplicationConfig {
    const env = process.env
    return {
      ...config,
      environment: (env.PLATFORM_ENV as any) || config.environment,
      logLevel: (env.LOG_LEVEL as any) || config.logLevel,
      debugMode: env.DEBUG === 'true',
      database: {
        ...config.database,
        type: (env.DB_TYPE as any) || config.database.type,
        path: env.DB_PATH || config.database.path,
        url: env.DATABASE_URL || config.database.url
      }
    }
  }

  private async loadSecrets(): Promise<Record<string, string>> {
    const secrets: Record<string, string> = {}

    // Load from environment
    if (process.env.OPENAI_API_KEY) secrets['providers.openai.apiKey'] = process.env.OPENAI_API_KEY
    if (process.env.GEMINI_API_KEY) secrets['providers.gemini.apiKey'] = process.env.GEMINI_API_KEY
    if (process.env.ELEVENLABS_API_KEY) secrets['providers.elevenLabs.apiKey'] = process.env.ELEVENLABS_API_KEY

    // Load from secrets file
    const secretsFile = path.join(this.secretsPath, 'secrets.json')
    if (fs.existsSync(secretsFile)) {
      try {
        const fileSecrets = fs.readJsonSync(secretsFile)
        Object.assign(secrets, fileSecrets)
      } catch (error) {
        console.warn('Failed to load secrets file')
      }
    }

    return secrets
  }

  private applySecrets(secrets: Record<string, string>): void {
    for (const [key, value] of Object.entries(secrets)) {
      this.set(key, value)
    }
  }

  private mergeConfig(base: ApplicationConfig, override: Partial<ApplicationConfig>): ApplicationConfig {
    return {
      ...base,
      ...override,
      database: { ...base.database, ...override.database },
      features: { ...base.features, ...override.features },
      services: { ...base.services, ...override.services },
      providers: { ...base.providers, ...override.providers },
      plugins: { ...base.plugins, ...override.plugins },
      customSettings: { ...base.customSettings, ...override.customSettings }
    }
  }
}
