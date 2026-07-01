import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ipc, JobSummary } from '../services/ipc'

export function useJobsQuery() {
  const qc = useQueryClient()
  const query = useQuery<JobSummary[]>(['jobs','list'], () => ipc.queue_list(), {
    refetchInterval: 2000,
    refetchOnWindowFocus: false,
  })

  async function enqueue(name: string, priority = 0) {
    const job = await ipc.queue_enqueue({ name, priority })
    // optimistic refetch
    qc.invalidateQueries(['jobs','list'])
    return job
  }

  async function cancel(id: string) {
    const ok = await ipc.queue_cancel(id)
    qc.invalidateQueries(['jobs','list'])
    return ok
  }

  async function pause(id: string) {
    const ok = await ipc.queue_pause(id)
    qc.invalidateQueries(['jobs','list'])
    return ok
  }

  async function resume(id: string) {
    const ok = await ipc.queue_resume(id)
    qc.invalidateQueries(['jobs','list'])
    return ok
  }

  return { ...query, enqueue, cancel, pause, resume }
}
