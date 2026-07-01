import React from 'react'
import { Job } from '../../store/useStore'

const Row: React.FC<{ job: Job }> = ({ job }) => {
  return (
    <tr className="border-b border-slate-700 hover:bg-slate-900">
      <td className="py-2 px-3 text-sm">{job.name}</td>
      <td className="py-2 px-3 text-sm">{job.status}</td>
      <td className="py-2 px-3 text-sm">{job.startedAt ?? '-'}</td>
      <td className="py-2 px-3 text-sm">{job.finishedAt ?? '-'}</td>
    </tr>
  )
}

export const RecentJobsTable: React.FC<{ jobs: Job[] }> = ({ jobs }) => {
  if (!jobs || jobs.length === 0) {
    return (
      <div className="p-4">
        <div className="text-slate-400">No recent jobs</div>
      </div>
    )
  }

  return (
    <div className="overflow-auto rounded-lg bg-slate-800">
      <table className="w-full table-fixed border-collapse">
        <thead className="text-slate-400 text-left text-xs border-b border-slate-700">
          <tr>
            <th className="py-2 px-3">Name</th>
            <th className="py-2 px-3">Status</th>
            <th className="py-2 px-3">Started</th>
            <th className="py-2 px-3">Finished</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((j) => (
            <Row key={j.id} job={j} />
          ))}
        </tbody>
      </table>
    </div>
  )
}
