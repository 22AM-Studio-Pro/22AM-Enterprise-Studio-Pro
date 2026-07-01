import React from 'react'
import { MainLayout } from '../layouts/MainLayout'
import { useStore } from '../store/useStore'
import { EmptyState } from '../components/EmptyState'
import { RecentJobsTable } from '../components/Tables/RecentJobsTable'

export const Jobs: React.FC = () => {
  const jobs = useStore((s) => s.jobs)

  return (
    <MainLayout>
      <h1 className="text-2xl font-semibold mb-4">Jobs</h1>
      {jobs.length === 0 ? (
        <EmptyState title="No jobs" description="No jobs have been enqueued yet." />
      ) : (
        <RecentJobsTable jobs={jobs} />
      )}
    </MainLayout>
  )
}
