import create from 'zustand'

export type PluginInfo = {
  id: string
  name: string
  version: string
  author?: string
  enabled: boolean
  status?: string
  path?: string
  permissions?: string[]
  dependencies?: string[]
  updatedAt?: string
}

type PluginState = {
  plugins: PluginInfo[]
  selected?: PluginInfo | null
  loading: boolean
  error?: string | null
  filters: { search?: string }
  setPlugins: (p: PluginInfo[]) => void
  setSelected: (p?: PluginInfo | null) => void
  setLoading: (v: boolean) => void
  setError: (e?: string | null) => void
}

export const usePluginStore = create<PluginState>((set) => ({
  plugins: [],
  selected: null,
  loading: false,
  error: null,
  filters: {},
  setPlugins: (p) => set({ plugins: p }),
  setSelected: (p) => set({ selected: p }),
  setLoading: (v) => set({ loading: v }),
  setError: (e) => set({ error: e })
}))
