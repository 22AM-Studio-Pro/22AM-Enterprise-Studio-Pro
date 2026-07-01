import fs from 'fs-extra'
import path from 'path'

export class CacheManager {
  private cacheDir: string
  private maxCacheSize: number

  constructor(cacheDir?: string, maxSizeBytes = 1024 * 1024 * 500) {
    this.cacheDir = cacheDir ?? path.resolve(process.cwd(), 'packages/assets/cache')
    this.maxCacheSize = maxSizeBytes
    fs.ensureDirSync(this.cacheDir)
  }

  set(key: string, value: Buffer | string) {
    const cachePath = path.join(this.cacheDir, key)
    fs.ensureFileSync(cachePath)
    fs.writeFileSync(cachePath, value)
  }

  get(key: string): Buffer | undefined {
    const cachePath = path.join(this.cacheDir, key)
    if (fs.existsSync(cachePath)) {
      return fs.readFileSync(cachePath)
    }
    return undefined
  }

  has(key: string): boolean {
    return fs.existsSync(path.join(this.cacheDir, key))
  }

  delete(key: string) {
    const cachePath = path.join(this.cacheDir, key)
    if (fs.existsSync(cachePath)) {
      fs.unlinkSync(cachePath)
    }
  }

  clear() {
    fs.emptyDirSync(this.cacheDir)
  }

  getCacheSize(): number {
    let size = 0
    const walk = (dir: string) => {
      const files = fs.readdirSync(dir)
      for (const f of files) {
        const p = path.join(dir, f)
        const stat = fs.statSync(p)
        if (stat.isFile()) size += stat.size
        else if (stat.isDirectory()) walk(p)
      }
    }
    if (fs.existsSync(this.cacheDir)) walk(this.cacheDir)
    return size
  }
}
