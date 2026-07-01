import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import schema from './workflow.schema.json'

const ajv = new Ajv({ allErrors: true })
addFormats(ajv)
const validate = ajv.compile(schema)

export function validateWorkflow(doc: unknown) {
  const ok = validate(doc)
  if (!ok) {
    const err = validate.errors?.map((e) => `${e.instancePath} ${e.message}`).join('; ') || 'invalid'
    throw new Error(`Workflow validation failed: ${err}`)
  }
  return doc as any
}
