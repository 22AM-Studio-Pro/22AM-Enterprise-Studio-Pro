export const enum PluginPermission {
  FS_READ = 'filesystem.read',
  FS_WRITE = 'filesystem.write',
  NETWORK = 'network',
  WORKFLOW_EXECUTE = 'workflow.execute',
  ASSETS_READ = 'assets.read',
  ASSETS_WRITE = 'assets.write',
  SCHEDULER = 'scheduler',
  SETTINGS = 'settings',
  LOGGER = 'logger'
}

export function hasPermission(manifestPermissions: string[] | undefined, permission: PluginPermission): boolean {
  if (!manifestPermissions) return false
  return manifestPermissions.includes(permission)
}
