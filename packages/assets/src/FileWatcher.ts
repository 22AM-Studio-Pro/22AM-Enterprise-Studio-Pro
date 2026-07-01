import fs from 'fs-extra'

export class FileWatcher {
  private watchers: Map<string, fs.FSWatcher> = new Map()
  private callbacks: Map<string, (event: string, filename: string) => void> = new Map()

  watch(filePath: string, callback: (event: string, filename: string) => void) {
    const watcher = fs.watch(filePath, (event, filename) => {
      callback(event, filename as string)
    })
    this.watchers.set(filePath, watcher)
    this.callbacks.set(filePath, callback)
  }

  unwatch(filePath: string) {
    const w = this.watchers.get(filePath)
    if (w) {
      w.close()
      this.watchers.delete(filePath)
      this.callbacks.delete(filePath)
    }
  }

  unwatchAll() {
    for (const [, w] of this.watchers) {
      w.close()
    }
    this.watchers.clear()
    this.callbacks.clear()
  }
}
