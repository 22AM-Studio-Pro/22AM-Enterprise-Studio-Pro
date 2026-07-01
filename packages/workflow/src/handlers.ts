import fs from 'fs/promises'
import path from 'path'

export async function fileRead(pathname: string): Promise<string> {
  return fs.readFile(pathname, 'utf-8')
}

export async function fileWrite(pathname: string, content: string): Promise<void> {
  await fs.mkdir(path.dirname(pathname), { recursive: true })
  await fs.writeFile(pathname, content, 'utf-8')
}

export async function echo(input?: Record<string, unknown>) {
  return input ?? null
}

export async function delayHandler(input?: Record<string, unknown>, _context?: Record<string, unknown>) {
  const ms = (input && (input.ms as number)) || 0
  await new Promise((r) => setTimeout(r, ms))
  return null
}

export async function httpRequestMock(_input?: Record<string, unknown>) {
  // Mock: return a deterministic response for tests
  return { status: 200, body: { ok: true } }
}
