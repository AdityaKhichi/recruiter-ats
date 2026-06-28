import React from 'react'
import useAuth from '../hooks/useAuth'

const StatCard: React.FC<{ title: string; value: string | number }> = ({ title, value }) => (
  <div className="bg-white rounded shadow p-4">
    <div className="text-sm text-slate-500">{title}</div>
    <div className="text-2xl font-semibold mt-2">{value}</div>
  </div>
)

const Dashboard: React.FC = () => {
  const { user } = useAuth()

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">Welcome to Recruiter Dashboard</h2>
        <p className="text-sm text-slate-600 mt-1">{user?.email ? `Signed in as ${user.email}` : 'Signed in'}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Jobs" value="--" />
        <StatCard title="Open Jobs" value="--" />
        <StatCard title="Total Candidates" value="--" />
        <StatCard title="Average Fit Score" value="--" />
      </div>
    </div>
  )
}

export default Dashboard
