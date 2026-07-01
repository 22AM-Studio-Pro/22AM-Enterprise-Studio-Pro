import fs from 'fs-extra'
import path from 'path'
import { PluginManifest } from './PluginManifest'
import { validateManifest } from './manifest.validator'

export class PluginLoader {
  async loadFromPath(pluginPath: string) {
    const manifestPath = path.resolve(pluginPath, 'manifest.json')
    if (!await fs.pathExists(manifestPath)) throw new Error('manifest not found')
    const raw = await fs.readFile(manifestPath, 'utf-8')
    const doc = JSON.parse(raw)
    const manifest = validateManifest(doc)

    const entry = path.resolve(pluginPath, manifest.entry)
    if (!await fs.pathExists(entry)) throw new Error('entry file not found: ' + entry)

    // dynamic import
    const mod = require(entry) // use require for CommonJS compatibility
    return { manifest, module: mod }
  }
}
