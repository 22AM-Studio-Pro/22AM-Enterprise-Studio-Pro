import React from 'react'
import { MainLayout } from '../layouts/MainLayout'
import { useJobsQuery } from '../hooks/useJobsQuery'
import { EmptyState } from '../components/EmptyState'
import { RecentJobsTable } from '../components/Tables/RecentJobsTable'

export const Jobs: React.FC = () => {
  const { data: jobs, isLoading, enqueue, cancel, pause, resume } = useJobsQuery()

  return (
    <MainLayout>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Jobs</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={async () => {
              await enqueue('Manual Job', 0)
            }}
            className="px-3 py-2 rounded bg-emerald-600 text-white"
          >
            Enqueue Job
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="p-4">Loading...</div>
      ) : jobs && jobs.length === 0 ? (
        <EmptyState title="No jobs" description="No jobs have been enqueued yet." />
      ) : (
        <div>
          <RecentJobsTable jobs={(jobs ?? [])} />
          <div className="mt-3 flex gap-2">
            {/* Example controls executed on the first job for demo; components should wire per-row actions in real UI */}
            {jobs && jobs[0] && (
              <>
                <button onClick={() => cancel(jobs[0].id)} className="px-3 py-2 rounded bg-rose-600 text-white">Cancel</button>
                <button onClick={() => pause(jobs[0].id)} className="px-3 py-2 rounded bg-amber-600 text-white">Pause</button>
                <button onClick={() => resume(jobs[0].id)} className="px-3 py-2 rounded bg-slate-600 text-white">Resume</button>
              </>
            )}
          </div>
        </div>
      )}
    </MainLayout>
  )
}
