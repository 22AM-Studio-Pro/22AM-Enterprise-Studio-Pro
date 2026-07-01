import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import schema from './manifest.schema.json'
import { PluginManifest } from './PluginManifest'

const ajv = new Ajv({ allErrors: true })
addFormats(ajv)
const validate = ajv.compile(schema)

export function validateManifest(doc: unknown): PluginManifest {
  const ok = validate(doc)
  if (!ok) {
    const err = validate.errors?.map((e) => `${e.instancePath} ${e.message}`).join('; ') || 'invalid manifest'
    throw new Error(`Plugin manifest validation failed: ${err}`)
  }
  return doc as PluginManifest
}
