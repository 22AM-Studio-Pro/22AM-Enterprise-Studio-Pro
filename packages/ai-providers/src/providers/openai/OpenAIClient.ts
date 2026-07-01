import { OpenAIConfig } from './OpenAIConfig'
import { RetryPolicy } from '../../RetryPolicy'

export type HttpClient = (url: string, init?: any) => Promise<{ status: number; json: () => Promise<any>; text?: () => Promise<string> }>

export class OpenAIClient {
  private base: string
  private http: HttpClient
  private retry: RetryPolicy

  constructor(config: OpenAIConfig, httpClient?: HttpClient, retry?: RetryPolicy) {
    this.base = config.apiBaseUrl ?? 'https://api.openai.com/v1'
    this.http = httpClient ?? (globalThis.fetch as unknown as HttpClient)
    this.retry = retry ?? new RetryPolicy()
  }

  async post(path: string, apiKey: string, body: any) {
    return this.retry.run(async () => {
      const res = await this.http(`${this.base}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify(body)
      })
      const json = await res.json()
      if (res.status >= 400) {
        const err: any = new Error(json?.error?.message || `OpenAI error ${res.status}`)
        err.code = json?.error?.type || String(res.status)
        throw err
      }
      return json
    })
  }
}
