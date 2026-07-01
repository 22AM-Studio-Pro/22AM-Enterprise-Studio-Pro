import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Sidebar } from '../components/Sidebar/Sidebar'
import { BrowserRouter } from 'react-router-dom'

describe('Sidebar', () => {
  it('renders navigation items', () => {
    render(
      <BrowserRouter>
        <Sidebar />
      </BrowserRouter>
    )

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Jobs')).toBeInTheDocument()
    expect(screen.getByText('Workflows')).toBeInTheDocument()
  })
})
