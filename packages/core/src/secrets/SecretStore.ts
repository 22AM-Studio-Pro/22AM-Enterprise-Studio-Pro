import crypto from 'crypto'
import fs from 'fs-extra'
import path from 'path'
import os from 'os'

export class SecretStore {
  private secretsPath: string
  private encryptionKey: string
  private secrets: Map<string, string> = new Map()

  constructor(secretsPath: string = path.join(os.homedir(), '.22am', 'secrets')) {
    this.secretsPath = secretsPath
    this.encryptionKey = this.getOrCreateEncryptionKey()
  }

  async initialize(): Promise<void> {
    await fs.ensureDir(this.secretsPath)
    await this.loadSecrets()
  }

  private getOrCreateEncryptionKey(): string {
    const keyPath = path.join(this.secretsPath, '.key')
    if (fs.existsSync(keyPath)) {
      return fs.readFileSync(keyPath, 'utf-8')
    }
    const key = crypto.randomBytes(32).toString('hex')
    fs.ensureDir(this.secretsPath)
    fs.writeFileSync(keyPath, key)
    fs.chmodSync(keyPath, 0o600) // Read/write for owner only
    return key
  }

  private encrypt(text: string): string {
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(this.encryptionKey, 'hex'), iv)
    const encrypted = Buffer.concat([cipher.update(text), cipher.final()])
    return `${iv.toString('hex')}:${encrypted.toString('hex')}`
  }

  private decrypt(encrypted: string): string {
    const [ivHex, encryptedHex] = encrypted.split(':')
    const iv = Buffer.from(ivHex, 'hex')
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(this.encryptionKey, 'hex'), iv)
    const decrypted = Buffer.concat([decipher.update(Buffer.from(encryptedHex, 'hex')), decipher.final()])
    return decrypted.toString()
  }

  async setSecret(key: string, value: string): Promise<void> {
    const encrypted = this.encrypt(value)
    this.secrets.set(key, encrypted)
    await this.persistSecrets()
  }

  getSecret(key: string): string | undefined {
    const encrypted = this.secrets.get(key)
    if (!encrypted) return undefined
    try {
      return this.decrypt(encrypted)
    } catch (error) {
      console.error(`Failed to decrypt secret: ${key}`)
      return undefined
    }
  }

  async removeSecret(key: string): Promise<void> {
    this.secrets.delete(key)
    await this.persistSecrets()
  }

  private async loadSecrets(): Promise<void> {
    const secretsFile = path.join(this.secretsPath, 'secrets.enc')
    if (!fs.existsSync(secretsFile)) return

    try {
      const data = fs.readJsonSync(secretsFile)
      this.secrets = new Map(Object.entries(data))
    } catch (error) {
      console.warn('Failed to load secrets file')
    }
  }

  private async persistSecrets(): Promise<void> {
    const secretsFile = path.join(this.secretsPath, 'secrets.enc')
    const data = Object.fromEntries(this.secrets)
    await fs.writeJson(secretsFile, data)
    fs.chmodSync(secretsFile, 0o600)
  }

  getAllSecretKeys(): string[] {
    return Array.from(this.secrets.keys())
  }
}
