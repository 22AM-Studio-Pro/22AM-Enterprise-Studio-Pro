import React, { create } from 'zustand'

export type SettingsState = {
  // Provider Settings
  providers: Record<string, any>
  setProviderSetting: (provider: string, key: string, value: any) => void

  // Database Settings
  databaseConfig: any
  setDatabaseConfig: (config: any) => void

  // Feature Toggles
  featureFlags: Record<string, boolean>
  setFeatureFlag: (feature: string, enabled: boolean) => void

  // Theme & UI
  theme: 'light' | 'dark'
  setTheme: (theme: 'light' | 'dark') => void
  language: string
  setLanguage: (lang: string) => void

  // Application Settings
  notifications: boolean
  setNotifications: (enabled: boolean) => void
  autoSave: boolean
  setAutoSave: (enabled: boolean) => void
}

export const useSettingsStore = create<SettingsState>((set) => ({
  providers: {},
  setProviderSetting: (provider, key, value) =>
    set((state) => ({
      providers: {
        ...state.providers,
        [provider]: { ...state.providers[provider], [key]: value }
      }
    })),

  databaseConfig: {},
  setDatabaseConfig: (config) => set({ databaseConfig: config }),

  featureFlags: {
    workflowDesigner: true,
    aiIntegration: true,
    contentPipeline: true,
    assetManagement: true,
    publishing: true
  },
  setFeatureFlag: (feature, enabled) =>
    set((state) => ({
      featureFlags: { ...state.featureFlags, [feature]: enabled }
    })),

  theme: 'light',
  setTheme: (theme) => set({ theme }),
  language: 'en',
  setLanguage: (lang) => set({ language: lang }),

  notifications: true,
  setNotifications: (enabled) => set({ notifications: enabled }),
  autoSave: true,
  setAutoSave: (enabled) => set({ autoSave: enabled })
}))
