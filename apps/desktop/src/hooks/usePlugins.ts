import { useEffect } from 'react'
import { usePluginStore } from '../stores/pluginStore'
import * as service from '../services/pluginService'

export function usePlugins() {
  const setPlugins = usePluginStore((s) => s.setPlugins)
  const setLoading = usePluginStore((s) => s.setLoading)
  const setError = usePluginStore((s) => s.setError)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    service.listPlugins().then((p) => {
      if (mounted) setPlugins(p)
    }).catch((e) => setError(String(e))).finally(() => setLoading(false))

    return () => { mounted = false }
  }, [setPlugins, setLoading, setError])
}
