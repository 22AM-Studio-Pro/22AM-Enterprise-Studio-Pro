import React from 'react'

export type EngineState = 'unknown' | 'running' | 'stopped' | 'error'

export type Job = {
  id: string
  name: string
  status: 'queued' | 'running' | 'failed' | 'completed' | 'scheduled'
  startedAt?: string
  finishedAt?: string
}

export type LogLine = {
  id: string
  timestamp: string
  level: 'info' | 'warn' | 'error' | 'debug'
  message: string
}

type Theme = 'dark' | 'light'

type Store = {
  engine: {
    status: EngineState
    lastUpdated?: string
  }
  jobs: Job[]
  scheduler: {
    scheduledJobs: string[]
  }
  logs: LogLine[]
  theme: Theme
  notifications: { id: string; message: string }[]

  // actions
  setEngineStatus: (status: EngineState) => void
  setJobs: (jobs: Job[]) => void
  setLogs: (logs: LogLine[]) => void
  pushLog: (line: LogLine) => void
  toggleTheme: () => void
}

import create from 'zustand'

export const useStore = create<Store>((set, get) => ({
  engine: { status: 'unknown' },
  jobs: [],
  scheduler: { scheduledJobs: [] },
  logs: [],
  theme: 'dark',
  notifications: [],

  setEngineStatus: (status) => set({ engine: { ...get().engine, status, lastUpdated: new Date().toISOString() } }),
  setJobs: (jobs) => set({ jobs }),
  setLogs: (logs) => set({ logs }),
  pushLog: (line) => set({ logs: [...get().logs, line] }),
  toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' }))
}))
