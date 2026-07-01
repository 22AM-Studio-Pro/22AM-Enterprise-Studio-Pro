import { useEffect } from 'react'
import { useStore } from '../store/useStore'
import { useEnginePolling, useJobsPolling, useLogsSubscription } from '../services/engine'

export function useEngine() {
  useEnginePolling()
  useLogsSubscription()
  useJobsPolling()

  const engine = useStore((s) => s.engine)
  return engine
}

export function useJobs() {
  const jobs = useStore((s) => s.jobs)
  return jobs
}

export function useLogs() {
  const logs = useStore((s) => s.logs)
  return logs
}
