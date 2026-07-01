import { RunwayConfig } from './RunwayConfig'
import { RetryPolicy } from '../../RetryPolicy'

export type HttpClient = (url: string, init?: any) => Promise<{ status: number; json: () => Promise<any>; headers?: any }>

export class RunwayClient {
  private base: string
  private http: HttpClient
  private retry: RetryPolicy

  constructor(config: RunwayConfig, httpClient?: HttpClient, retry?: RetryPolicy) {
    this.base = config.apiBaseUrl ?? 'https://api.runwayml.com/v1'
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
        const err: any = new Error(json?.error?.message || `Runway error ${res.status}`)
        err.code = json?.error?.type || String(res.status)
        throw err
      }
      return json
    })
  }

  async get(path: string, apiKey: string) {
    return this.retry.run(async () => {
      const res = await this.http(`${this.base}${path}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${apiKey}` }
      })
      const json = await res.json()
      if (res.status >= 400) {
        const err: any = new Error(json?.error?.message || `Runway error ${res.status}`)
        err.code = json?.error?.type || String(res.status)
        throw err
      }
      return json
    })
  }
}
