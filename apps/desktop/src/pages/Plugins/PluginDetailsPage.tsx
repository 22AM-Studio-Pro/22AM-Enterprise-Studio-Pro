import React from 'react'
import { usePluginStore } from '../../stores/pluginStore'
import { PluginStatusBadge } from '../../components/PluginStatusBadge'
import { PluginPermissionList } from '../../components/PluginPermissionList'
import { PluginDependencyTree } from '../../components/PluginDependencyTree'
import * as service from '../../services/pluginService'

export const PluginDetailsPage: React.FC = () => {
  const selected = usePluginStore((s) => s.selected)
  const setError = usePluginStore((s) => s.setError)
  const [logs, setLogs] = React.useState<string[]>([])

  if (!selected) return <div>Select a plugin</div>

  const onReload = async () => {
    try {
      await service.reloadPlugin(selected.id)
    } catch (e: any) { setError(String(e)) }
  }

  const onEnable = async () => {
    try { await service.enablePlugin(selected.id) } catch (e: any) { setError(String(e)) }
  }

  const onDisable = async () => {
    try { await service.disablePlugin(selected.id) } catch (e: any) { setError(String(e)) }
  }

  const onLogs = async () => {
    try {
      const l = await service.pluginLogs(selected.id)
      setLogs(l as string[])
    } catch (e: any) { setError(String(e)) }
  }

  return (
    <div>
      <h2>{selected.name} <PluginStatusBadge enabled={selected.enabled} /></h2>
      <p>{selected.version} — {selected.author}</p>
      <h3>Manifest</h3>
      <pre>{JSON.stringify(selected, null, 2)}</pre>
      <h3>Permissions</h3>
      <PluginPermissionList permissions={selected.permissions} />
      <h3>Dependencies</h3>
      <PluginDependencyTree dependencies={selected.dependencies} />

      <div className="actions">
        <button onClick={onEnable}>Enable</button>
        <button onClick={onDisable}>Disable</button>
        <button onClick={onReload}>Reload</button>
        <button onClick={onLogs}>Logs</button>
      </div>

      <div>
        <h3>Logs</h3>
        <div>{logs.map((l,i) => <pre key={i}>{l}</pre>)}</div>
      </div>
    </div>
  )
}
