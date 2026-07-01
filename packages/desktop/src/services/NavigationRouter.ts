import React from 'react'
import { useDesktopStore } from '../store/DesktopStore'

export class NavigationRouter {
  private guards: Map<string, any> = new Map()
  private routes: Map<string, React.ComponentType<any>> = new Map()

  registerRoute(path: string, component: React.ComponentType<any>): void {
    this.routes.set(path, component)
  }

  registerGuard(path: string, guard: any): void {
    this.guards.set(path, guard)
  }

  async canNavigate(from: string, to: string, state: any): Promise<boolean> {
    // Check canDeactivate guard on current route
    const fromGuard = this.guards.get(from)
    if (fromGuard?.canDeactivate) {
      const canLeave = await fromGuard.canDeactivate(from, state)
      if (!canLeave) return false
    }

    // Check canActivate guard on target route
    const toGuard = this.guards.get(to)
    if (toGuard?.canActivate) {
      const canEnter = await toGuard.canActivate(to, from, state)
      if (!canEnter) return false
    }

    return true
  }

  getComponent(path: string): React.ComponentType<any> | undefined {
    return this.routes.get(path)
  }
}

export const useNavigation = () => {
  const { setLastVisitedTab } = useDesktopStore()

  return {
    navigate: (path: string) => {
      setLastVisitedTab(path)
      // Implementation will navigate to the route
    }
  }
}
