import React from 'react'
import { MainLayout } from '../layouts/MainLayout'

export const Assets: React.FC = () => {
  return (
    <MainLayout>
      <h1 className="text-2xl font-semibold mb-4">Assets</h1>
      <div className="rounded-lg bg-slate-800 p-4 text-slate-200">Assets listing will appear here when available.</div>
    </MainLayout>
  )
}
