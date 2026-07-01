import { invoke } from '@tauri-apps/api/tauri'
import { listen, UnlistenFn } from '@tauri-apps/api/event'

export type EngineStatus = {
  status: 'unknown' | 'running' | 'stopped' | 'error'
  workers: number
  queue_size: number
  memory_usage_bytes?: number
  cpu_percent?: number
}

export type JobSummary = {
  id: string
  name: string
  status: 'queued' | 'running' | 'failed' | 'completed' | 'scheduled' | 'paused'
  priority: number
  retries: number
  started_at?: string
  finished_at?: string
}

export type LogLine = {
  id: string
  timestamp: string
  level: 'info' | 'warn' | 'error' | 'debug'
  message: string
}

// IPC wrappers — all calls centralized here
export const ipc = {
  async engine_status(): Promise<EngineStatus> {
    return invoke('engine_status')
  },
  async engine_start(): Promise<boolean> {
    return invoke('engine_start')
  },
  async engine_stop(): Promise<boolean> {
    return invoke('engine_stop')
  },
  async engine_restart(): Promise<boolean> {
    return invoke('engine_restart')
  },
  async queue_list(): Promise<JobSummary[]> {
    return invoke('queue_list')
  },
  async queue_enqueue(payload: { name: string; priority?: number; payload?: Record<string, unknown> }): Promise<JobSummary> {
    return invoke('queue_enqueue', payload)
  },
  async queue_cancel(id: string): Promise<boolean> {
    return invoke('queue_cancel', { id })
  },
  async queue_pause(id: string): Promise<boolean> {
    return invoke('queue_pause', { id })
  },
  async queue_resume(id: string): Promise<boolean> {
    return invoke('queue_resume', { id })
  },
  async scheduler_list(): Promise<any[]> {
    return invoke('scheduler_list')
  },
  async workflow_list(): Promise<any[]> {
    return invoke('workflow_list')
  },
  async plugins_list(): Promise<any[]> {
    return invoke('plugins_list')
  },
  async assets_list(): Promise<any[]> {
    return invoke('assets_list')
  },
  async settings_get(): Promise<Record<string, unknown>> {
    return invoke('settings_get')
  },
  async settings_update(payload: Record<string, unknown>): Promise<boolean> {
    return invoke('settings_update', payload)
  },

  // events
  async onLog(cb: (line: LogLine) => void): Promise<UnlistenFn> {
    const unlisten = await listen('engine:log', (event) => {
      const payload = event.payload as LogLine
      cb(payload)
    })
    return unlisten
  },
  async onStatus(cb: (status: EngineStatus) => void): Promise<UnlistenFn> {
    const unlisten = await listen('engine:status', (event) => {
      const payload = event.payload as EngineStatus
      cb(payload)
    })
    return unlisten
  }
}
