import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import App from '../App'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

vi.mock('../services/ipc', () => ({
  ipc: {
    engine_status: async () => ({ status: 'running', workers: 1, queue_size: 0 }),
    queue_list: async () => [],
    onLog: async () => () => {},
    onStatus: async () => () => {}
  }
}))

const qc = new QueryClient()

describe('App routing', () => {
  it('renders Dashboard route by default', async () => {
    render(
      <QueryClientProvider client={qc}>
        <App />
      </QueryClientProvider>
    )

    expect(await screen.findByText(/Dashboard/i)).toBeInTheDocument()
  })
})
