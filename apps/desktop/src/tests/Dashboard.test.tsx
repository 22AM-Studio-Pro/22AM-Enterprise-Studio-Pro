import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Dashboard } from '../pages/Dashboard'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

vi.mock('../services/ipc', () => ({
  ipc: {
    engine_status: async () => ({ status: 'running', workers: 2, queue_size: 3 }),
    queue_list: async () => [{ id: '1', name: 'job1', status: 'queued', priority: 0, retries: 0 }],
    onLog: async () => () => {},
    onStatus: async () => () => {}
  }
}))

const qc = new QueryClient()

describe('Dashboard', () => {
  it('renders status cards', async () => {
    render(
      <QueryClientProvider client={qc}>
        <Dashboard />
      </QueryClientProvider>
    )

    expect(await screen.findByText(/Engine/i)).toBeInTheDocument()
    expect(await screen.findByText(/Queue/i)).toBeInTheDocument()
  })
})
