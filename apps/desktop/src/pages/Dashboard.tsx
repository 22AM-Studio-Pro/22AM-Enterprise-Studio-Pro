import React from 'react'
import { MainLayout } from '../layouts/MainLayout'
import { StatusCard } from '../components/Cards/StatusCard'
import { RecentJobsTable } from '../components/Tables/RecentJobsTable'
import { RecentLogs } from '../components/Logs/RecentLogs'
import { useStore } from '../store/useStore'
import { EmptyState } from '../components/EmptyState'

export const Dashboard: React.FC = () => {
  const engine = useStore((s) => s.engine)
  const jobs = useStore((s) => s.jobs)
  const logs = useStore((s) => s.logs)

  return (
    <MainLayout>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatusCard title="Engine" value={engine.status} />
        <StatusCard title="Queue" value={jobs.filter((j) => j.status === 'queued').length} />
        <StatusCard title="Running" value={jobs.filter((j) => j.status === 'running').length} />
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <div className="mb-2 text-sm text-slate-400">Recent Jobs</div>
          {jobs.length === 0 ? <EmptyState title="No jobs" description="There are no recent jobs to display." /> : <RecentJobsTable jobs={jobs} />}
        </div>

        <div>
          <div className="mb-2 text-sm text-slate-400">Recent Logs</div>
          <div className="rounded-lg bg-slate-800 p-2">
            <RecentLogs logs={logs} />
          </div>

          <div className="mt-4">
            <div className="text-sm text-slate-400 mb-2">System Health</div>
            <div className="p-3 rounded bg-slate-800 text-slate-200">All systems nominal</div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
