import { ipc, EngineStatus, JobSummary, LogLine } from './ipc'
import { useEffect } from 'react'
import { useStore } from '../store/useStore'

const POLL_MS = 1500

export async function refreshOnce() {
  const [s, jobs] = await Promise.all([ipc.engine_status(), ipc.queue_list()])
  useStore.getState().setEngineStatus(s.status as any)
  useStore.getState().setJobs(jobs.map((j) => ({ id: j.id, name: j.name, status: j.status as any, startedAt: j.started_at, finishedAt: j.finished_at })))
}

export function useEnginePolling() {
  useEffect(() => {
    let mounted = true
    let interval = 0 as unknown as number

    const tick = async () => {
      try {
        const status = await ipc.engine_status()
        if (!mounted) return
        useStore.getState().setEngineStatus(status.status as any)
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('engine poll failed', e)
      }
    }

    tick()
    interval = window.setInterval(tick, POLL_MS)

    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [])
}

export function useJobsPolling() {
  useEffect(() => {
    let mounted = true
    const tick = async () => {
      try {
        const jobs = await ipc.queue_list()
        if (!mounted) return
        useStore.getState().setJobs(jobs.map((j) => ({ id: j.id, name: j.name, status: j.status as any, startedAt: j.started_at, finishedAt: j.finished_at })))
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('jobs poll failed', e)
      }
    }

    tick()
    const id = window.setInterval(tick, POLL_MS)
    return () => {
      mounted = false
      clearInterval(id)
    }
  }, [])
}

export function useLogsSubscription() {
  useEffect(() => {
    let mounted = true
    let unlisten: (() => void) | undefined
    ;(async () => {
      unlisten = await ipc.onLog((line: LogLine) => {
        if (!mounted) return
        useStore.getState().pushLog({ id: line.id, timestamp: line.timestamp, level: line.level, message: line.message })
      })
    })()

    return () => {
      mounted = false
      if (unlisten) unlisten()
    }
  }, [])
}
