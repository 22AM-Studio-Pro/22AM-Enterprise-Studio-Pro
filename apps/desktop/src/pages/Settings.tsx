import React from 'react'
import { MainLayout } from '../layouts/MainLayout'

export const Settings: React.FC = () => {
  return (
    <MainLayout>
      <h1 className="text-2xl font-semibold mb-4">Settings</h1>
      <div className="rounded-lg bg-slate-800 p-4 text-slate-200">Application settings</div>
    </MainLayout>
  )
}
