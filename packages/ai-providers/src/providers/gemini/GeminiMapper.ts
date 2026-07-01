export function mapTextRequest(prompt: string, model?: string) {
  return {
    model: model ?? 'gemini-mini',
    prompt
  }
}

export function extractTextFromResponse(resp: any) {
  if (!resp) return ''
  if (resp.output && Array.isArray(resp.output)) {
    return resp.output.map((o: any) => o.text || o.content || '').join('\n')
  }
  if (resp.candidates && resp.candidates.length > 0) {
    return resp.candidates.map((c: any) => c.content || c.text || '').join('\n')
  }
  if (resp.text) return resp.text
  return JSON.stringify(resp)
}
