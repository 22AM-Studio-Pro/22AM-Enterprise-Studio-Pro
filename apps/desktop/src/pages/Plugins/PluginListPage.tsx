import React from 'react'
import { usePluginStore } from '../stores/pluginStore'
import { usePlugins } from '../hooks/usePlugins'
import { PluginCard } from '../components/PluginCard'
import { PluginToolbar } from '../components/PluginToolbar'
import { PluginInstallDialog } from '../components/PluginInstallDialog'
import * as service from '../services/pluginService'

export const PluginListPage: React.FC = () => {
  usePlugins()
  const plugins = usePluginStore((s) => s.plugins)
  const loading = usePluginStore((s) => s.loading)
  const setError = usePluginStore((s) => s.setError)

  const [installOpen, setInstallOpen] = React.useState(false)

  const onInstall = async (path: string) => {
    try {
      await service.installPluginFromPath(path)
      // refresh
      const list = await service.listPlugins()
      usePluginStore.getState().setPlugins(list)
      setInstallOpen(false)
    } catch (e: any) {
      setError(String(e))
    }
  }

  return (
    <div>
      <h2>Installed Plugins</h2>
      <PluginToolbar onInstall={() => setInstallOpen(true)} onRefresh={async () => { const list = await service.listPlugins(); usePluginStore.getState().setPlugins(list) }} />
      {loading ? <p>Loading...</p> : (
        <div className="plugin-grid">
          {plugins.map((p) => <PluginCard key={p.id} plugin={p} onSelect={() => usePluginStore.getState().setSelected(p)} />)}
        </div>
      )}
      <PluginInstallDialog open={installOpen} onClose={() => setInstallOpen(false)} onInstall={onInstall} />
    </div>
  )
}
