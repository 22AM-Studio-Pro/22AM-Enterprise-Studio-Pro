export type Voice = { voice_id: string; name: string }

export function mapTTSRequest(text: string, voiceId?: string, model?: string) {
  return {
    text,
    voice_settings: { stability: 0.5, similarity_boost: 0.75 },
    model_id: model ?? 'eleven_monolingual_v1'
  }
}

export function extractVoicesFromResponse(resp: any): Voice[] {
  if (!resp) return []
  if (resp.voices && Array.isArray(resp.voices)) {
    return resp.voices.map((v: any) => ({ voice_id: v.voice_id, name: v.name }))
  }
  return []
}
