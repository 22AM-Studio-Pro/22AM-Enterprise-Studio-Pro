import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Jobs } from '../pages/Jobs'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

vi.mock('../hooks/useJobsQuery', async () => {
  const actual = await vi.importActual('../hooks/useJobsQuery')
  return { useJobsQuery: () => ({ data: [], isLoading: false, enqueue: async () => null, cancel: async () => true, pause: async () => true, resume: async () => true }) }
})

const qc = new QueryClient()

describe('Jobs page', () => {
  it('shows enqueue button', () => {
    render(
      <QueryClientProvider client={qc}>
        <Jobs />
      </QueryClientProvider>
    )

    expect(screen.getByText('Enqueue Job')).toBeInTheDocument()
  })
})
