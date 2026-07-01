export class PublishingCredentialManager {
  private credentials: Map<string, Map<string, string>> = new Map()

  saveCredential(platform: string, key: string, value: string) {
    if (!this.credentials.has(platform)) {
      this.credentials.set(platform, new Map())
    }
    this.credentials.get(platform)!.set(key, value)
  }

  getCredential(platform: string, key: string): string | undefined {
    return this.credentials.get(platform)?.get(key)
  }

  deleteCredential(platform: string, key: string) {
    this.credentials.get(platform)?.delete(key)
  }

  clearPlatformCredentials(platform: string) {
    this.credentials.delete(platform)
  }

  hasCredentials(platform: string): boolean {
    return this.credentials.has(platform) && this.credentials.get(platform)!.size > 0
  }
}
