import crypto from 'crypto'

export class CredentialManager {
  private store: Map<string, string>

  constructor() {
    this.store = new Map()
  }

  saveCredential(providerName: string, keyName: string, secret: string) {
    const token = crypto.randomBytes(16).toString('hex')
    this.store.set(`${providerName}:${keyName}`, secret)
    return token
  }

  getCredential(providerName: string, keyName: string) {
    return this.store.get(`${providerName}:${keyName}`)
  }

  deleteCredential(providerName: string, keyName: string) {
    this.store.delete(`${providerName}:${keyName}`)
  }
}
