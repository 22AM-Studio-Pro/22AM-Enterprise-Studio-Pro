import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ipc, EngineStatus } from '../services/ipc'

export function useEngineQuery() {
  const qc = useQueryClient()
  const query = useQuery<EngineStatus>(['engine','status'], () => ipc.engine_status(), {
    refetchInterval: 2000,
    refetchOnWindowFocus: false,
  })

  // subscribe to status events to update cache
  async function subscribe() {
    try {
      const unlisten = await ipc.onStatus((s: EngineStatus) => {
        qc.setQueryData(['engine','status'], s)
      })
      return unlisten
    } catch (e) {
      // ignore in non-tauri env
      // eslint-disable-next-line no-console
      console.warn('status subscribe failed', e)
      return undefined
    }
  }

  return { ...query, subscribe }
}
