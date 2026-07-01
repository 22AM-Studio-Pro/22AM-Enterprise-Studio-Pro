export function mapChatRequest(prompt: string, model?: string) {
  return {
    model: model ?? 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }]
  }
}

export function extractTextFromResponse(resp: any) {
  // support a few response shapes
  if (!resp) return ''
  if (resp.choices && resp.choices.length > 0) {
    const c = resp.choices[0]
    if (c.message && c.message.content) return c.message.content
    if (c.text) return c.text
  }
  if (resp.output && Array.isArray(resp.output)) return resp.output.map((o: any) => o.content || '').join('\n')
  return JSON.stringify(resp)
}
