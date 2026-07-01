import { create } from 'zustand'
import { SessionState, NotificationState, LoadingState } from '../types/desktop'
import { persist } from 'zustand/middleware'

export type DesktopStore = {
  // Session State
  session: SessionState
  setCurrentWorkflow: (workflowId: string) => void
  addRecentProject: (projectId: string) => void
  setWindowState: (state: any) => void
  setTheme: (theme: 'light' | 'dark') => void
  toggleSidebar: () => void
  setLastVisitedTab: (tab: string) => void

  // Notifications
  notifications: NotificationState[]
  addNotification: (notification: Omit<NotificationState, 'id' | 'timestamp'>) => void
  dismissNotification: (id: string) => void

  // Loading States
  loading: LoadingState
  setLoading: (loading: boolean, progress?: number, message?: string) => void

  // Dashboard Data
  dashboardWidgets: any[]
  refreshDashboard: () => Promise<void>
}

const defaultSession: SessionState = {
  recentProjects: [],
  windowState: { width: 1200, height: 800 },
  theme: 'light',
  sidebarCollapsed: false,
  lastVisitedTab: 'dashboard'
}

export const useDesktopStore = create<DesktopStore>(
  persist(
    (set, get) => ({
      session: defaultSession,

      setCurrentWorkflow: (workflowId) =>
        set((state) => ({
          session: { ...state.session, currentWorkflowId: workflowId }
        })),

      addRecentProject: (projectId) =>
        set((state) => ({
          session: {
            ...state.session,
            recentProjects: [projectId, ...state.session.recentProjects].slice(0, 10)
          }
        })),

      setWindowState: (windowState) =>
        set((state) => ({
          session: { ...state.session, windowState }
        })),

      setTheme: (theme) =>
        set((state) => ({
          session: { ...state.session, theme }
        })),

      toggleSidebar: () =>
        set((state) => ({
          session: { ...state.session, sidebarCollapsed: !state.session.sidebarCollapsed }
        })),

      setLastVisitedTab: (tab) =>
        set((state) => ({
          session: { ...state.session, lastVisitedTab: tab }
        })),

      notifications: [],

      addNotification: (notification) =>
        set((state) => {
          const id = `notif-${Date.now()}`
          const newNotification: NotificationState = {
            ...notification,
            id,
            timestamp: new Date().toISOString()
          }
          return { notifications: [...state.notifications, newNotification] }
        }),

      dismissNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id)
        })),

      loading: { isLoading: false },

      setLoading: (isLoading, progress, message) =>
        set({ loading: { isLoading, progress, message } }),

      dashboardWidgets: [],

      refreshDashboard: async () => {
        // This will be wired to real dashboard service
        set({ dashboardWidgets: [] })
      }
    }),
    {
      name: 'desktop-store',
      partialize: (state) => ({ session: state.session })
    }
  )
)
