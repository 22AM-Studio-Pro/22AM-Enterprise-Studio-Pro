import { ElevenLabsConfig } from './ElevenLabsConfig'
import { RetryPolicy } from '../../RetryPolicy'

export type HttpClient = (url: string, init?: any) => Promise<{ status: number; json: () => Promise<any>; arrayBuffer?: () => Promise<ArrayBuffer> }>

export class ElevenLabsClient {
  private base: string
  private http: HttpClient
  private retry: RetryPolicy

  constructor(config: ElevenLabsConfig, httpClient?: HttpClient, retry?: RetryPolicy) {
    this.base = config.apiBaseUrl ?? 'https://api.elevenlabs.io/v1'
    this.http = httpClient ?? (globalThis.fetch as unknown as HttpClient)
    this.retry = retry ?? new RetryPolicy()
  }

  async post(path: string, apiKey: string, body: any) {
    return this.retry.run(async () => {
      const res = await this.http(`${this.base}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'xi-api-key': apiKey },
        body: JSON.stringify(body)
      })
      if (res.status >= 400) {
        const json = await res.json()
        const err: any = new Error(json?.message || `ElevenLabs error ${res.status}`)
        err.code = String(res.status)
        throw err
      }
      return res.json()
    })
  }

  async get(path: string, apiKey: string) {
    return this.retry.run(async () => {
      const res = await this.http(`${this.base}${path}`, {
        method: 'GET',
        headers: { 'xi-api-key': apiKey }
      })
      if (res.status >= 400) {
        const json = await res.json()
        const err: any = new Error(json?.message || `ElevenLabs error ${res.status}`)
        err.code = String(res.status)
        throw err
      }
      return res.json()
    })
  }
}
