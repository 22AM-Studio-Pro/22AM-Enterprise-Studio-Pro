export type WindowState = {
  x?: number
  y?: number
  width: number
  height: number
  maximized?: boolean
  fullscreen?: boolean
}

export type SessionState = {
  userId?: string
  currentWorkflowId?: string
  recentProjects: string[]
  windowState: WindowState
  theme: 'light' | 'dark'
  sidebarCollapsed: boolean
  lastVisitedTab: string
}

export type NavigationGuard = {
  canActivate: (to: string, from: string, state: any) => Promise<boolean>
  canDeactivate: (from: string, state: any) => Promise<boolean>
}

export type NotificationState = {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  duration?: number
  timestamp: string
  dismissed?: boolean
}

export type LoadingState = {
  isLoading: boolean
  progress?: number
  message?: string
}

export type ErrorBoundaryState = {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
  recovered: boolean
}
